import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UserAdministrationForbiddenError } from '@/core/accounts/errors/user.errors';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { IdentitiesRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Identities.repository';
import { OwnershipTransferInvitationsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/OwnershipTransferInvitations.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { Roles } from '@/shared/accessControl/roles';
import { NativeDateProvider } from '@/shared/providers/date/implementations/NativeDate.provider';
import {
	UserAdministrativeCapabilityActions,
	UserAdministrativeCapabilities,
} from './getUserAdministrativeCapabilities.dtos';
import { GetUserAdministrativeCapabilitiesService } from './GetUserAdministrativeCapabilities.service';

let usersRepository: UsersRepositoryInMemory;
let credentialsRepository: CredentialsRepositoryInMemory;
let identitiesRepository: IdentitiesRepositoryInMemory;
let invitationsRepository: OwnershipTransferInvitationsRepositoryInMemory;
let service: GetUserAdministrativeCapabilitiesService;

const expectCapabilities = (
	actual: UserAdministrativeCapabilities,
	actions: UserAdministrativeCapabilities['actions'],
	roleTransitions: UserAdministrativeCapabilities['roleTransitions'],
) => {
	expect(actual).toEqual({ actions, roleTransitions });
};

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
	usersRepository = new UsersRepositoryInMemory();
	credentialsRepository = new CredentialsRepositoryInMemory();
	identitiesRepository = new IdentitiesRepositoryInMemory();
	invitationsRepository = new OwnershipTransferInvitationsRepositoryInMemory();
	service = new GetUserAdministrativeCapabilitiesService(
		usersRepository,
		credentialsRepository,
		identitiesRepository,
		invitationsRepository,
		new NativeDateProvider(),
	);
});

describe('GetUserAdministrativeCapabilitiesService', () => {
	it('returns no administrative actions for the actor own user', async () => {
		const owner = await usersRepository.create(createUserFactory({ role: Roles.owner }));

		const result = await service.execute({ id: owner.id, actor: { id: owner.id, role: owner.role } });

		expect(result).toBeDefined();
		expectCapabilities(result, [], []);
	});

	it('returns active-member actions available to an admin', async () => {
		const admin = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		const member = await usersRepository.create(createUserFactory({ email: 'member@example.com' }));

		const result = await service.execute({ id: member.id, actor: { id: admin.id, role: admin.role } });

		expect(result).toBeDefined();
		expectCapabilities(
			result,
			[UserAdministrativeCapabilityActions.changeRole, UserAdministrativeCapabilityActions.suspend],
			[Roles.partner],
		);
	});

	it('returns reactivate and close only when the managed target is suspended', async () => {
		const admin = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		const member = await usersRepository.create(
			createUserFactory({ email: 'member@example.com', status: UserStatuses.suspended }),
		);

		const result = await service.execute({ id: member.id, actor: { id: admin.id, role: admin.role } });

		expect(result).toBeDefined();
		expectCapabilities(
			result,
			[
				UserAdministrativeCapabilityActions.changeRole,
				UserAdministrativeCapabilityActions.reactivate,
				UserAdministrativeCapabilityActions.close,
			],
			[Roles.partner],
		);
	});

	it('returns no mutation capabilities for an admin peer', async () => {
		const admin = await usersRepository.create(
			createUserFactory({ email: 'admin@example.com', role: Roles.admin }),
		);
		const peer = await usersRepository.create(createUserFactory({ email: 'peer@example.com', role: Roles.admin }));

		const result = await service.execute({ id: peer.id, actor: { id: admin.id, role: admin.role } });

		expect(result).toBeDefined();
		expectCapabilities(result, [], []);
	});

	it('offers ownership transfer only to an eligible active admin with authentication', async () => {
		const owner = await usersRepository.create(
			createUserFactory({ email: 'owner@example.com', role: Roles.owner, emailVerified: true }),
		);
		const target = await usersRepository.create(
			createUserFactory({ email: 'target@example.com', role: Roles.admin, emailVerified: true }),
		);
		await credentialsRepository.create({ userId: target.id, passwordHash: 'hash' });

		const result = await service.execute({ id: target.id, actor: { id: owner.id, role: owner.role } });

		expect(result).toBeDefined();
		expectCapabilities(
			result,
			[
				UserAdministrativeCapabilityActions.changeRole,
				UserAdministrativeCapabilityActions.suspend,
				UserAdministrativeCapabilityActions.requestOwnershipTransfer,
			],
			[Roles.partner, Roles.member],
		);
	});

	it('hides ownership transfer while an unexpired invitation exists', async () => {
		const owner = await usersRepository.create(
			createUserFactory({ email: 'owner@example.com', role: Roles.owner }),
		);
		const target = await usersRepository.create(
			createUserFactory({ email: 'target@example.com', role: Roles.admin, emailVerified: true }),
		);
		await credentialsRepository.create({ userId: target.id, passwordHash: 'hash' });
		await invitationsRepository.create({
			scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
			currentOwnerId: owner.id,
			targetUserId: target.id,
			tokenHash: 'token-hash',
			reason: 'Scheduled owner transition',
			ownerSessionVersion: owner.sessionVersion,
			targetSessionVersion: target.sessionVersion,
			expiresAt: new Date('2025-01-02T00:00:00.000Z'),
		});

		const result = await service.execute({ id: target.id, actor: { id: owner.id, role: owner.role } });

		expect(result.actions).not.toContain(UserAdministrativeCapabilityActions.requestOwnershipTransfer);
	});

	it('hides ownership transfer when the target has no authentication method', async () => {
		const owner = await usersRepository.create(
			createUserFactory({ email: 'owner@example.com', role: Roles.owner }),
		);
		const target = await usersRepository.create(
			createUserFactory({ email: 'target@example.com', role: Roles.admin, emailVerified: true }),
		);

		const result = await service.execute({ id: target.id, actor: { id: owner.id, role: owner.role } });

		expect(result.actions).not.toContain(UserAdministrativeCapabilityActions.requestOwnershipTransfer);
	});

	it('rejects non-administrative actors', async () => {
		const actor = await usersRepository.create(createUserFactory({ email: 'member@example.com' }));
		const target = await usersRepository.create(createUserFactory({ email: 'target@example.com' }));

		await expect(
			service.execute({ id: target.id, actor: { id: actor.id, role: Roles.owner } }),
		).rejects.toBeInstanceOf(UserAdministrationForbiddenError);
	});
});
