import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { GetUserService } from './GetUser.service';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';

let usersRepository: IUsersRepository;
let service: GetUserService;

const { name, surname, email, role, status } = createUserFactory();

const admin: Actor = { id: new ObjectId().toString(), role: Roles.admin };
const member: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('Get User', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new GetUserService(usersRepository);
	});

	it('should be able to get a user when the actor is an admin', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });

		const result = await service.execute({ id: createdUser._id.toString(), actor: admin });

		expect(result._id).toEqual(createdUser._id);
		expect(result.email).toEqual(createdUser.email);
		expect(result.name).toEqual(createdUser.name);
		expect(result.surname).toEqual(createdUser.surname);
		expect(result.role).toEqual(createdUser.role);
		expect(result).not.toHaveProperty('password');
	});

	it('Should not be able to find a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId, actor: admin })).rejects.toBeInstanceOf(NotFoundError);
	});

	it('should not be able to get a user when the actor is a member', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });

		await expect(service.execute({ id: createdUser._id.toString(), actor: member })).rejects.toBeInstanceOf(
			ForbiddenError,
		);
	});
});
