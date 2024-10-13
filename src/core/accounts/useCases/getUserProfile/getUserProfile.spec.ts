import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { GetUserProfileService } from './GetUserProfile.service';
import { NotFoundError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { User } from '@/core/accounts/entities/user.entity';
import { createUserFactory } from '@/core/accounts/factories/user.factories';

let usersRepositoryInMemory: IUsersRepository;
let service: GetUserProfileService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('User Profile', () => {
	beforeEach(() => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new GetUserProfileService(usersRepositoryInMemory);
	});

	it('should be able to find a user profile', async () => {
		await usersRepositoryInMemory.create({ name, surname, email, password, role, status });
		const userTest = (await usersRepositoryInMemory.findByEmail(email)) as User;

		const result = await service.execute({ id: userTest._id.toString() });

		expect(result._id).toEqual(userTest._id);
		expect(result.email).toEqual(userTest.email);
		expect(result.name).toEqual(userTest.name);
		expect(result.surname).toEqual(userTest.surname);
		expect(result.role).toEqual(userTest.role);
	});

	it('Should not be able to find a nonexistent user profile', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(NotFoundError);
	});
});
