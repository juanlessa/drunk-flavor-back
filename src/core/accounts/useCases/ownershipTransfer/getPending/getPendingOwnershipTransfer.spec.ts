import { beforeEach, describe, expect, it } from 'vitest';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import { User } from '@/core/accounts/entities/user.entity';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { OwnershipTransferInvitationsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/OwnershipTransferInvitations.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { GetPendingOwnershipTransferService } from './GetPendingOwnershipTransfer.service';

const reason = 'The current owner is transitioning operational responsibility';
const expiresAt = new Date('2025-01-02T00:00:00.000Z');

let usersRepository: UsersRepositoryInMemory;
let invitationsRepository: OwnershipTransferInvitationsRepositoryInMemory;
let service: GetPendingOwnershipTransferService;

const createParticipants = async (): Promise<{ owner: User; target: User }> => {
	const owner = await usersRepository.create(
		createUserFactory({ email: 'owner@example.com', role: Roles.owner, emailVerified: true }),
	);
	const target = await usersRepository.create(
		createUserFactory({ email: 'target@example.com', role: Roles.admin, emailVerified: true }),
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
		expiresAt,
	});

describe('Get Pending Ownership Transfer', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		invitationsRepository = new OwnershipTransferInvitationsRepositoryInMemory();
		service = new GetPendingOwnershipTransferService(usersRepository, invitationsRepository);
	});

	it('returns the public view of the invitation to the current owner', async () => {
		const { owner, target } = await createParticipants();
		await createInvitation(owner, target);

		const pending = await service.execute({ actor: { id: owner.id, role: owner.role } });

		expect(pending).toEqual({ targetUserId: target.id, reason, expiresAt });
	});

	it('returns null when there is no invitation', async () => {
		const { owner } = await createParticipants();

		expect(await service.execute({ actor: { id: owner.id, role: owner.role } })).toBeNull();
	});

	it('hides the invitation from an actor other than the current owner', async () => {
		const { owner, target } = await createParticipants();
		await createInvitation(owner, target);

		expect(await service.execute({ actor: { id: target.id, role: target.role } })).toBeNull();
	});
});
