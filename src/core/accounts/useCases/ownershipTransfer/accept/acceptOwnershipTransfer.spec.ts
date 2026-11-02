import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { User } from '@/core/accounts/entities/user.entity';
import { OwnershipTransferInvalidError } from '@/core/accounts/errors/ownershipTransfer.errors';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { AdministrativeEventsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/AdministrativeEvents.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { OwnershipTransferInvitationsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/OwnershipTransferInvitations.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { NativeDateProvider } from '@/shared/providers/date/implementations/NativeDate.provider';
import {
	MOCK_TEMPLATE_HTML,
	MockTemplateProvider,
} from '@/shared/providers/template/implementations/MockTemplate.provider';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { AcceptOwnershipTransferService } from './AcceptOwnershipTransfer.service';
import { SessionVersionMarkerStoreInMemory } from '@/core/accounts/stores/inMemory/SessionVersionMarker.store';

const now = new Date('2025-01-01T00:00:00.000Z');
const reason = 'The current owner is transitioning operational responsibility';

let usersRepository: UsersRepositoryInMemory;
let credentialsRepository: CredentialsRepositoryInMemory;
let invitationsRepository: OwnershipTransferInvitationsRepositoryInMemory;
let eventsRepository: AdministrativeEventsRepositoryInMemory;
let emailQueueProvider: MockEmailQueueProvider;
let service: AcceptOwnershipTransferService;

const createEligibleParticipants = async (): Promise<{ owner: User; target: User }> => {
	const owner = await usersRepository.create(
		createUserFactory({ email: 'owner@example.com', role: Roles.owner, emailVerified: true, sessionVersion: 2 }),
	);
	const target = await usersRepository.create(
		createUserFactory({ email: 'target@example.com', role: Roles.admin, emailVerified: true, sessionVersion: 3 }),
	);
	await credentialsRepository.create({ userId: target.id, passwordHash: 'hash' });
	return { owner, target };
};

const createInvitation = async (
	owner: User,
	target: User,
	overrides: Partial<{ ownerSessionVersion: number; expiresAt: Date }> = {},
) =>
	invitationsRepository.create({
		scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
		currentOwnerId: owner.id,
		targetUserId: target.id,
		tokenHash: 'hash:accept-token',
		reason,
		ownerSessionVersion: overrides.ownerSessionVersion ?? owner.sessionVersion,
		targetSessionVersion: target.sessionVersion,
		expiresAt: overrides.expiresAt ?? new Date('2025-01-02T00:00:00.000Z'),
	});

describe('Accept Ownership Transfer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
		usersRepository = new UsersRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		invitationsRepository = new OwnershipTransferInvitationsRepositoryInMemory();
		eventsRepository = new AdministrativeEventsRepositoryInMemory();
		const cryptoProvider: ICryptoProvider = {
			generateToken: vi.fn(async () => 'plain-token'),
			hashToken: vi.fn((token: string) => `hash:${token}`),
		};
		const templateProvider: MockTemplateProvider = new MockTemplateProvider();
		emailQueueProvider = new MockEmailQueueProvider();
		service = new AcceptOwnershipTransferService(
			usersRepository,
			credentialsRepository,
			new IdentitiesRepositoryInMemory(),
			invitationsRepository,
			eventsRepository,
			cryptoProvider,
			new NativeDateProvider(),
			new FakeTransactionManager(),
			templateProvider,
			emailQueueProvider,
			new SessionVersionMarkerStoreInMemory(),
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('atomically swaps roles, increments both session versions, consumes the invitation, and audits both changes', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await service.execute({ token: 'accept-token', actor: { id: target.id, role: target.role } });

		expect(await usersRepository.findById(owner.id)).toMatchObject({ role: Roles.admin, sessionVersion: 3 });
		expect(await usersRepository.findById(target.id)).toMatchObject({ role: Roles.owner, sessionVersion: 4 });
		expect(await invitationsRepository.findSingleton()).toBeNull();
		expect(eventsRepository.collection.map((event) => event.action)).toEqual([
			AdministrativeEventActions.ownershipTransferred,
			AdministrativeEventActions.userRoleChanged,
		]);
		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(2);
	});

	it('rejects an unknown token', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await expect(
			service.execute({ token: 'wrong-token', actor: { id: target.id, role: target.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
	});

	it('rejects an authenticated actor different from the invited target', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await expect(
			service.execute({ token: 'accept-token', actor: { id: owner.id, role: owner.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
	});

	it('rejects expired invitations', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target, { expiresAt: new Date('2024-12-31T23:59:59.000Z') });

		await expect(
			service.execute({ token: 'accept-token', actor: { id: target.id, role: target.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
	});

	it('rejects participant session changes made after invitation creation', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target, { ownerSessionVersion: owner.sessionVersion - 1 });

		await expect(
			service.execute({ token: 'accept-token', actor: { id: target.id, role: target.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
	});

	it('keeps the completed transfer successful when notification enqueueing fails', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);
		emailQueueProvider.addMock.mockRejectedValue(new Error('Queue unavailable'));

		await expect(
			service.execute({ token: 'accept-token', actor: { id: target.id, role: target.role } }),
		).resolves.toBeUndefined();
		expect((await usersRepository.findById(target.id))?.role).toBe(Roles.owner);
	});
});
