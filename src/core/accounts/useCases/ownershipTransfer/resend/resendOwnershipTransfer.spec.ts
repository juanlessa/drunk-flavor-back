import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { User } from '@/core/accounts/entities/user.entity';
import { OwnershipTransferInvitationNotFoundError } from '@/core/accounts/errors/ownershipTransfer.errors';
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
import { ResendOwnershipTransferService } from './ResendOwnershipTransfer.service';

const now = new Date('2025-01-01T00:00:00.000Z');
const reason = 'The current owner is transitioning operational responsibility';

let usersRepository: UsersRepositoryInMemory;
let credentialsRepository: CredentialsRepositoryInMemory;
let invitationsRepository: OwnershipTransferInvitationsRepositoryInMemory;
let eventsRepository: AdministrativeEventsRepositoryInMemory;
let emailQueueProvider: MockEmailQueueProvider;
let service: ResendOwnershipTransferService;

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

const createInvitation = async (owner: User, target: User, overrides: Partial<{ tokenHash: string }> = {}) =>
	invitationsRepository.create({
		scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
		currentOwnerId: owner.id,
		targetUserId: target.id,
		tokenHash: overrides.tokenHash ?? 'hash:accept-token',
		reason,
		ownerSessionVersion: owner.sessionVersion,
		targetSessionVersion: target.sessionVersion,
		expiresAt: new Date('2025-01-02T00:00:00.000Z'),
	});

describe('Resend Ownership Transfer', () => {
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
		service = new ResendOwnershipTransferService(
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

	it('rotates the token and snapshots, extends expiration, audits, and emails the target', async () => {
		const { owner, target } = await createEligibleParticipants();
		const invitation = await createInvitation(owner, target, { tokenHash: 'old-hash' });

		await service.execute({ actor: { id: owner.id, role: owner.role } });

		const updated = await invitationsRepository.findSingleton();
		expect(updated).toMatchObject({
			id: invitation.id,
			tokenHash: 'hash:plain-token',
			ownerSessionVersion: owner.sessionVersion,
			targetSessionVersion: target.sessionVersion,
		});
		expect(eventsRepository.collection.at(-1)?.action).toBe(AdministrativeEventActions.ownershipTransferResent);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.ownershipTransferInvitation,
			expect.objectContaining({ to: target.email }),
		);
	});

	it('rejects resend when there is no pending invitation', async () => {
		const { owner } = await createEligibleParticipants();

		await expect(service.execute({ actor: { id: owner.id, role: owner.role } })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
	});

	it('hides the invitation from an actor who is no longer its active owner', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);
		await usersRepository.update({ id: owner.id, status: UserStatuses.suspended });

		await expect(service.execute({ actor: { id: owner.id, role: owner.role } })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
	});
});
