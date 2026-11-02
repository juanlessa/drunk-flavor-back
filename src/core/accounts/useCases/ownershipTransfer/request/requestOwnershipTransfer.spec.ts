import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	OWNERSHIP_TRANSFER_INVITATION_SCOPE,
	OWNERSHIP_TRANSFER_INVITATION_TTL_HOURS,
} from '@/core/accounts/constants/ownershipTransfer.constants';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { User } from '@/core/accounts/entities/user.entity';
import {
	OwnershipTransferAlreadyPendingError,
	OwnershipTransferInvalidError,
	OwnershipTransferTargetIneligibleError,
} from '@/core/accounts/errors/ownershipTransfer.errors';
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
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { RequestOwnershipTransferService } from './RequestOwnershipTransfer.service';

const now = new Date('2025-01-01T00:00:00.000Z');
const reason = 'The current owner is transitioning operational responsibility';

let usersRepository: UsersRepositoryInMemory;
let credentialsRepository: CredentialsRepositoryInMemory;
let invitationsRepository: OwnershipTransferInvitationsRepositoryInMemory;
let eventsRepository: AdministrativeEventsRepositoryInMemory;
let emailQueueProvider: MockEmailQueueProvider;
let service: RequestOwnershipTransferService;

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

const createInvitation = async (owner: User, target: User, overrides: Partial<{ expiresAt: Date }> = {}) =>
	invitationsRepository.create({
		scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
		currentOwnerId: owner.id,
		targetUserId: target.id,
		tokenHash: 'hash:accept-token',
		reason,
		ownerSessionVersion: owner.sessionVersion,
		targetSessionVersion: target.sessionVersion,
		expiresAt: overrides.expiresAt ?? new Date('2025-01-02T00:00:00.000Z'),
	});

describe('Request Ownership Transfer', () => {
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
		service = new RequestOwnershipTransferService(
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
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('creates a hashed 24-hour singleton invitation, audits it, and emails the target', async () => {
		const { owner, target } = await createEligibleParticipants();

		await service.execute({
			targetUserId: target.id,
			reason,
			actor: { id: owner.id, role: owner.role },
		});

		const invitation = await invitationsRepository.findSingleton();
		expect(invitation).toMatchObject({
			currentOwnerId: owner.id,
			targetUserId: target.id,
			tokenHash: 'hash:plain-token',
			ownerSessionVersion: 2,
			targetSessionVersion: 3,
		});
		expect(invitation?.expiresAt).toEqual(
			new Date(now.getTime() + OWNERSHIP_TRANSFER_INVITATION_TTL_HOURS * 60 * 60 * 1000),
		);
		expect(invitation?.tokenHash).not.toBe('plain-token');
		expect(eventsRepository.collection).toEqual([
			expect.objectContaining({
				action: AdministrativeEventActions.ownershipTransferRequested,
				actorId: owner.id,
				targetUserId: target.id,
				reason,
			}),
		]);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.ownershipTransferInvitation,
			expect.objectContaining({ to: target.email, html: MOCK_TEMPLATE_HTML.ownershipTransferInvitation }),
		);
	});

	it('replaces an expired invitation instead of blocking a new request', async () => {
		const { owner, target } = await createEligibleParticipants();
		const expired = await createInvitation(owner, target, { expiresAt: new Date('2024-12-31T23:59:59.000Z') });

		await service.execute({ targetUserId: target.id, reason, actor: { id: owner.id, role: owner.role } });

		const replacement = await invitationsRepository.findSingleton();
		expect(replacement?.id).not.toBe(expired.id);
		expect(replacement?.tokenHash).toBe('hash:plain-token');
	});

	it('rejects a request while a current invitation exists', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await expect(
			service.execute({ targetUserId: target.id, reason, actor: { id: owner.id, role: owner.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferAlreadyPendingError);
	});

	it('rejects actors who are not the persisted active owner', async () => {
		const { target } = await createEligibleParticipants();
		const admin = await usersRepository.create(
			createUserFactory({ email: 'other-admin@example.com', role: Roles.admin }),
		);

		await expect(
			service.execute({ targetUserId: target.id, reason, actor: { id: admin.id, role: Roles.owner } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
	});

	it('rejects an eligible-looking administrator without an authentication method', async () => {
		const owner = await usersRepository.create(
			createUserFactory({ email: 'owner@example.com', role: Roles.owner }),
		);
		const target = await usersRepository.create(
			createUserFactory({ email: 'target@example.com', role: Roles.admin, emailVerified: true }),
		);

		await expect(
			service.execute({ targetUserId: target.id, reason, actor: { id: owner.id, role: owner.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferTargetIneligibleError);
	});
});
