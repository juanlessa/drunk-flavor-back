import { User } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError, ForbiddenError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { Roles } from '@/shared/accessControl/roles';
import { Actor } from '@/shared/accessControl/actor.types';
import {
	AdminPeerManagementForbiddenError,
	OwnerManagementRequiresTransferError,
	UserAdministrationForbiddenError,
	UserSelfAdministrationForbiddenError,
} from '@/core/accounts/errors/user.errors';
import { UpdateUserRoleService } from './UpdateUserRole.service';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';

let usersRepository: IUsersRepository;
let service: UpdateUserRoleService;

const { name, surname, email, role, status } = createUserFactory({ role: Roles.partner });

let owner: Actor;
let admin: Actor;
let member: Actor;

describe('Update User Role', () => {
	beforeEach(async () => {
		usersRepository = new UsersRepositoryInMemory();
		const persistedOwner = await usersRepository.create(
			createUserFactory({ email: 'owner-actor@example.com', role: Roles.owner }),
		);
		const persistedAdmin = await usersRepository.create(
			createUserFactory({ email: 'admin-actor@example.com', role: Roles.admin }),
		);
		const persistedMember = await usersRepository.create(
			createUserFactory({ email: 'member-actor@example.com', role: Roles.member }),
		);
		owner = { id: persistedOwner.id, role: persistedOwner.role };
		admin = { id: persistedAdmin.id, role: persistedAdmin.role };
		member = { id: persistedMember.id, role: persistedMember.role };
		service = new UpdateUserRoleService(usersRepository, new FakeTransactionManager());
	});

	it('Should be able to update the role of a user', async () => {
		const createdPartnerUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
		});

		await service.execute({ userId: createdPartnerUser.id, role: Roles.admin, actor: owner });

		const verifyUser = (await usersRepository.findById(createdPartnerUser.id)) as User;

		expect(verifyUser.role).toEqual(Roles.admin);
	});

	it('Should not be able to update the role of a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(
			service.execute({
				userId: nonexistentId,
				role: Roles.admin,
				actor: owner,
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('Should not be able to update a user role when the actor is a member', async () => {
		const createdPartnerUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
		});

		await expect(
			service.execute({ userId: createdPartnerUser.id, role: Roles.admin, actor: member }),
		).rejects.toBeInstanceOf(ForbiddenError);

		const verifyUser = (await usersRepository.findById(createdPartnerUser.id)) as User;
		expect(verifyUser.role).toEqual(role);
	});

	it('does not demote the owner through the generic role update', async () => {
		await expect(service.execute({ userId: owner.id, role: Roles.admin, actor: admin })).rejects.toBeInstanceOf(
			OwnerManagementRequiresTransferError,
		);

		expect((await usersRepository.findById(owner.id))?.role).toBe(Roles.owner);
	});

	it('does not assign owner through the generic role update', async () => {
		const target = await usersRepository.create(createUserFactory({ email: 'owner-target@example.com' }));

		await expect(service.execute({ userId: target.id, role: Roles.owner, actor: owner })).rejects.toBeInstanceOf(
			OwnerManagementRequiresTransferError,
		);
		expect((await usersRepository.findById(target.id))?.role).toBe(Roles.member);
	});

	it('does not let an admin promote a user to admin', async () => {
		const target = await usersRepository.create(createUserFactory({ email: 'promotion-target@example.com' }));

		await expect(service.execute({ userId: target.id, role: Roles.admin, actor: admin })).rejects.toBeInstanceOf(
			UserAdministrationForbiddenError,
		);
		expect((await usersRepository.findById(target.id))?.role).toBe(Roles.member);
	});

	it('does not let an admin demote another admin', async () => {
		const otherAdmin = await usersRepository.create(
			createUserFactory({ email: 'other-admin@example.com', role: Roles.admin }),
		);

		await expect(
			service.execute({ userId: otherAdmin.id, role: Roles.member, actor: admin }),
		).rejects.toBeInstanceOf(AdminPeerManagementForbiddenError);
		expect((await usersRepository.findById(otherAdmin.id))?.role).toBe(Roles.admin);
	});

	it('does not let an actor change their own role through user administration', async () => {
		await expect(service.execute({ userId: admin.id, role: Roles.member, actor: admin })).rejects.toBeInstanceOf(
			UserSelfAdministrationForbiddenError,
		);

		expect((await usersRepository.findById(admin.id))?.role).toBe(Roles.admin);
	});

	it('treats an authorized current-role assignment as a no-op', async () => {
		const target = await usersRepository.create(createUserFactory({ email: 'noop-target@example.com' }));
		const updateSpy = vi.spyOn(usersRepository, 'update');

		await service.execute({ userId: target.id, role: Roles.member, actor: admin });

		expect(updateSpy).not.toHaveBeenCalled();
		expect((await usersRepository.findById(target.id))?.role).toBe(Roles.member);
	});
});
