import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	OWNERSHIP_TRANSFER_INVITATION_SCOPE,
	OWNERSHIP_TRANSFER_INVITATION_TTL_HOURS,
} from '@/core/accounts/constants/ownershipTransfer.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { User } from '@/core/accounts/entities/user.entity';
import {
	OwnershipTransferAlreadyPendingError,
	OwnershipTransferInvalidError,
	OwnershipTransferInvitationNotFoundError,
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
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { AcceptOwnershipTransferService } from './accept/AcceptOwnershipTransfer.service';
import { CancelOwnershipTransferService } from './cancel/CancelOwnershipTransfer.service';
import { RequestOwnershipTransferService } from './request/RequestOwnershipTransfer.service';
import { ResendOwnershipTransferService } from './resend/ResendOwnershipTransfer.service';

const now = new Date('2025-01-01T00:00:00.000Z');
const reason = 'The current owner is transitioning operational responsibility';

let usersRepository: UsersRepositoryInMemory;
let credentialsRepository: CredentialsRepositoryInMemory;
let identitiesRepository: IdentitiesRepositoryInMemory;
let invitationsRepository: OwnershipTransferInvitationsRepositoryInMemory;
let eventsRepository: AdministrativeEventsRepositoryInMemory;
let cryptoProvider: ICryptoProvider;
let templateProvider: ITemplateProvider;
let emailQueueProvider: MockEmailQueueProvider;
let requestService: RequestOwnershipTransferService;
let resendService: ResendOwnershipTransferService;
let acceptService: AcceptOwnershipTransferService;
let cancelService: CancelOwnershipTransferService;

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
	overrides: Partial<{
		tokenHash: string;
		ownerSessionVersion: number;
		targetSessionVersion: number;
		expiresAt: Date;
	}> = {},
) =>
	invitationsRepository.create({
		scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
		currentOwnerId: owner.id,
		targetUserId: target.id,
		tokenHash: overrides.tokenHash ?? 'hash:accept-token',
		reason,
		ownerSessionVersion: overrides.ownerSessionVersion ?? owner.sessionVersion,
		targetSessionVersion: overrides.targetSessionVersion ?? target.sessionVersion,
		expiresAt: overrides.expiresAt ?? new Date('2025-01-02T00:00:00.000Z'),
	});

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(now);
	usersRepository = new UsersRepositoryInMemory();
	credentialsRepository = new CredentialsRepositoryInMemory();
	identitiesRepository = new IdentitiesRepositoryInMemory();
	invitationsRepository = new OwnershipTransferInvitationsRepositoryInMemory();
	eventsRepository = new AdministrativeEventsRepositoryInMemory();
	cryptoProvider = {
		generateToken: vi.fn(async () => 'plain-token'),
		hashToken: vi.fn((token: string) => `hash:${token}`),
	};
	templateProvider = {
		emailVerification: vi.fn(async () => 'verification-template'),
		forgotPassword: vi.fn(async () => 'password-template'),
		ownershipTransferInvitation: vi.fn(async () => 'invitation-template'),
		ownershipTransferChanged: vi.fn(async () => 'changed-template'),
	};
	emailQueueProvider = new MockEmailQueueProvider();
	const dateProvider = new NativeDateProvider();
	const transactionManager = new FakeTransactionManager();
	requestService = new RequestOwnershipTransferService(
		usersRepository,
		credentialsRepository,
		identitiesRepository,
		invitationsRepository,
		eventsRepository,
		cryptoProvider,
		dateProvider,
		transactionManager,
		templateProvider,
		emailQueueProvider,
	);
	resendService = new ResendOwnershipTransferService(
		usersRepository,
		credentialsRepository,
		identitiesRepository,
		invitationsRepository,
		eventsRepository,
		cryptoProvider,
		dateProvider,
		transactionManager,
		templateProvider,
		emailQueueProvider,
	);
	acceptService = new AcceptOwnershipTransferService(
		usersRepository,
		credentialsRepository,
		identitiesRepository,
		invitationsRepository,
		eventsRepository,
		cryptoProvider,
		dateProvider,
		transactionManager,
		templateProvider,
		emailQueueProvider,
	);
	cancelService = new CancelOwnershipTransferService(
		usersRepository,
		invitationsRepository,
		eventsRepository,
		transactionManager,
	);
});

afterEach(() => {
	vi.useRealTimers();
});

describe('RequestOwnershipTransferService', () => {
	it('creates a hashed 24-hour singleton invitation, audits it, and emails the target', async () => {
		const { owner, target } = await createEligibleParticipants();

		await requestService.execute({
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
			expect.objectContaining({ to: target.email, html: 'invitation-template' }),
		);
	});

	it('replaces an expired invitation instead of blocking a new request', async () => {
		const { owner, target } = await createEligibleParticipants();
		const expired = await createInvitation(owner, target, { expiresAt: new Date('2024-12-31T23:59:59.000Z') });

		await requestService.execute({ targetUserId: target.id, reason, actor: { id: owner.id, role: owner.role } });

		const replacement = await invitationsRepository.findSingleton();
		expect(replacement?.id).not.toBe(expired.id);
		expect(replacement?.tokenHash).toBe('hash:plain-token');
	});

	it('rejects a request while a current invitation exists', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await expect(
			requestService.execute({ targetUserId: target.id, reason, actor: { id: owner.id, role: owner.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferAlreadyPendingError);
	});

	it('rejects actors who are not the persisted active owner', async () => {
		const { target } = await createEligibleParticipants();
		const admin = await usersRepository.create(
			createUserFactory({ email: 'other-admin@example.com', role: Roles.admin }),
		);

		await expect(
			requestService.execute({ targetUserId: target.id, reason, actor: { id: admin.id, role: Roles.owner } }),
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
			requestService.execute({ targetUserId: target.id, reason, actor: { id: owner.id, role: owner.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferTargetIneligibleError);
	});
});

describe('ResendOwnershipTransferService', () => {
	it('rotates the token and snapshots, extends expiration, audits, and emails the target', async () => {
		const { owner, target } = await createEligibleParticipants();
		const invitation = await createInvitation(owner, target, { tokenHash: 'old-hash' });

		await resendService.execute({ actor: { id: owner.id, role: owner.role } });

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

		await expect(resendService.execute({ actor: { id: owner.id, role: owner.role } })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
	});

	it('hides the invitation from an actor who is no longer its active owner', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);
		await usersRepository.update({ id: owner.id, status: UserStatuses.suspended });

		await expect(resendService.execute({ actor: { id: owner.id, role: owner.role } })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
	});
});

describe('AcceptOwnershipTransferService', () => {
	it('atomically swaps roles, increments both session versions, consumes the invitation, and audits both changes', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await acceptService.execute({ token: 'accept-token', actor: { id: target.id, role: target.role } });

		expect(await usersRepository.findById(owner.id)).toMatchObject({ role: Roles.admin, sessionVersion: 3 });
		expect(await usersRepository.findById(target.id)).toMatchObject({ role: Roles.owner, sessionVersion: 4 });
		expect(await invitationsRepository.findSingleton()).toBeNull();
		expect(eventsRepository.collection.map((event) => event.action)).toEqual([
			AdministrativeEventActions.ownershipTransferred,
			AdministrativeEventActions.userRoleChanged,
		]);
		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(2);
	});

	it('rejects an unknown token and an authenticated actor different from the target', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await expect(
			acceptService.execute({ token: 'wrong-token', actor: { id: target.id, role: target.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
		await expect(
			acceptService.execute({ token: 'accept-token', actor: { id: owner.id, role: owner.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
	});

	it('rejects expired invitations', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target, { expiresAt: new Date('2024-12-31T23:59:59.000Z') });

		await expect(
			acceptService.execute({ token: 'accept-token', actor: { id: target.id, role: target.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
	});

	it('rejects participant session changes made after invitation creation', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target, { ownerSessionVersion: owner.sessionVersion - 1 });

		await expect(
			acceptService.execute({ token: 'accept-token', actor: { id: target.id, role: target.role } }),
		).rejects.toBeInstanceOf(OwnershipTransferInvalidError);
	});

	it('keeps the completed transfer successful when notification enqueueing fails', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);
		emailQueueProvider.addMock.mockRejectedValue(new Error('Queue unavailable'));

		await expect(
			acceptService.execute({ token: 'accept-token', actor: { id: target.id, role: target.role } }),
		).resolves.toBeUndefined();
		expect((await usersRepository.findById(target.id))?.role).toBe(Roles.owner);
	});
});

describe('CancelOwnershipTransferService', () => {
	it('lets the current active owner consume the invitation and records cancellation', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await cancelService.execute({ actor: { id: owner.id, role: owner.role } });

		expect(await invitationsRepository.findSingleton()).toBeNull();
		expect(eventsRepository.collection).toEqual([
			expect.objectContaining({
				action: AdministrativeEventActions.ownershipTransferCancelled,
				actorId: owner.id,
				targetUserId: target.id,
			}),
		]);
	});

	it('rejects cancellation when there is no invitation', async () => {
		const { owner } = await createEligibleParticipants();

		await expect(cancelService.execute({ actor: { id: owner.id, role: owner.role } })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
	});

	it('hides the invitation from an actor other than the current owner', async () => {
		const { owner, target } = await createEligibleParticipants();
		await createInvitation(owner, target);

		await expect(cancelService.execute({ actor: { id: target.id, role: target.role } })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
		expect(await invitationsRepository.findSingleton()).not.toBeNull();
	});
});
