import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { User } from '@/core/accounts/entities/user.entity';
import { OwnershipTransferInvitationNotFoundError } from '@/core/accounts/errors/ownershipTransfer.errors';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { AdministrativeEventsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/AdministrativeEvents.repository';
import { OwnershipTransferInvitationsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/OwnershipTransferInvitations.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { CancelOwnershipTransferService } from './CancelOwnershipTransfer.service';

const now = new Date('2025-01-01T00:00:00.000Z');
const reason = 'The current owner is transitioning operational responsibility';

let usersRepository: UsersRepositoryInMemory;
let invitationsRepository: OwnershipTransferInvitationsRepositoryInMemory;
let eventsRepository: AdministrativeEventsRepositoryInMemory;
let service: CancelOwnershipTransferService;

const createParticipants = async (): Promise<{ owner: User; target: User }> => {
	const owner = await usersRepository.create(
		createUserFactory({ email: 'owner@example.com', role: Roles.owner, emailVerified: true, sessionVersion: 2 }),
	);
	const target = await usersRepository.create(
		createUserFactory({ email: 'target@example.com', role: Roles.admin, emailVerified: true, sessionVersion: 3 }),
	);
	return { owner, target };
};

const createInvitation = async (owner: User, target: User) =>
	invitationsRepository.create({
		scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
		currentOwnerId: owner.id,
		targetUserId: target.id,
		tokenHash: 'hash:accept-token',
		reason,
		ownerSessionVersion: owner.sessionVersion,
		targetSessionVersion: target.sessionVersion,
		expiresAt: new Date('2025-01-02T00:00:00.000Z'),
	});

describe('Cancel Ownership Transfer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
		usersRepository = new UsersRepositoryInMemory();
		invitationsRepository = new OwnershipTransferInvitationsRepositoryInMemory();
		eventsRepository = new AdministrativeEventsRepositoryInMemory();
		service = new CancelOwnershipTransferService(
			usersRepository,
			invitationsRepository,
			eventsRepository,
			new FakeTransactionManager(),
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('lets the current active owner consume the invitation and records cancellation', async () => {
		const { owner, target } = await createParticipants();
		await createInvitation(owner, target);

		await service.execute({ actor: { id: owner.id, role: owner.role } });

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
		const { owner } = await createParticipants();

		await expect(service.execute({ actor: { id: owner.id, role: owner.role } })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
	});

	it('hides the invitation from an actor other than the current owner', async () => {
		const { owner, target } = await createParticipants();
		await createInvitation(owner, target);

		await expect(service.execute({ actor: { id: target.id, role: target.role } })).rejects.toBeInstanceOf(
			OwnershipTransferInvitationNotFoundError,
		);
		expect(await invitationsRepository.findSingleton()).not.toBeNull();
	});
});
