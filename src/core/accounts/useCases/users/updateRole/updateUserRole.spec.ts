import { User } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserRoleService } from './UpdateUserRole.service';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { Roles } from '@/shared/accessControl/roles';
import { Actor } from '@/shared/accessControl/actor.types';

let usersRepository: IUsersRepository;
let service: UpdateUserRoleService;

const { name, surname, email, role, status } = createUserFactory({ role: Roles.partner });

const admin: Actor = { id: new ObjectId().toString(), role: Roles.admin };
const member: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('Update User Role', () => {
	beforeEach(async () => {
		usersRepository = new UsersRepositoryInMemory();
		service = new UpdateUserRoleService(usersRepository);
	});

	it('Should be able to update the role of a user', async () => {
		const createdPartnerUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
		});

		await service.execute({ user_id: createdPartnerUser._id.toString(), role: Roles.admin, actor: admin });

		const verifyUser = (await usersRepository.findById(createdPartnerUser._id.toString())) as User;

		expect(verifyUser.role).toEqual(Roles.admin);
	});

	it('Should not be able to update the role of a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(
			service.execute({
				user_id: nonexistentId,
				role: Roles.admin,
				actor: admin,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
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
			service.execute({ user_id: createdPartnerUser._id.toString(), role: Roles.admin, actor: member }),
		).rejects.toBeInstanceOf(ForbiddenError);

		const verifyUser = (await usersRepository.findById(createdPartnerUser._id.toString())) as User;
		expect(verifyUser.role).toEqual(role);
	});
});
