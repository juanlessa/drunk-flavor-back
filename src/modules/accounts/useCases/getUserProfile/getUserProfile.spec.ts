import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { GetUserProfileService } from './GetUserProfile.service';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { User, UserRolesEnum } from '@/modules/accounts/entities/user.entity';

let usersRepositoryInMemory: IUsersRepository;
let service: GetUserProfileService;

// test constants
const email = 'user@test.com';
const password = '123456789';
const name = 'User';
const surname = 'Test';
const role = UserRolesEnum.partner;

describe('User Profile', () => {
	beforeEach(() => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new GetUserProfileService(usersRepositoryInMemory);
	});

	it('should be able to find a user profile', async () => {
		await usersRepositoryInMemory.create({ name, surname, email, password, role });
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
