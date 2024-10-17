import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { GetUserService } from './GetUser.service';

let usersRepository: IUsersRepository;
let service: GetUserService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('Get User', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new GetUserService(usersRepository);
	});

	it('should be able to get user', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });

		const result = await service.execute({ id: createdUser._id.toString() });

		expect(result._id).toEqual(createdUser._id);
		expect(result.email).toEqual(createdUser.email);
		expect(result.name).toEqual(createdUser.name);
		expect(result.surname).toEqual(createdUser.surname);
		expect(result.role).toEqual(createdUser.role);
		expect(result).not.toHaveProperty('password');
	});

	it('Should not be able to find a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(NotFoundError);
	});
});
