import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import AppError from '@shared/errors/AppError';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProfileUserService } from '@modules/accounts/useCases/profileUser/ProfileUser.service';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let profileUserService: ProfileUserService;

// test constants
const email = 'user@test.com';
const password = '123456789';
const name = 'User';
const surname = 'Test';
const role = ROLES.partner;

describe('User Profile', () => {
	beforeEach(() => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		profileUserService = new ProfileUserService(usersRepositoryInMemory);
	});

	it('should be able to find a user profile', async () => {
		await usersRepositoryInMemory.create({ name, surname, email, password, role });
		const userTest = await usersRepositoryInMemory.findByEmail(email);

		const result = await profileUserService.execute({ id: userTest._id });

		expect(result._id).toEqual(userTest._id);
		expect(result.email).toEqual(userTest.email);
		expect(result.name).toEqual(userTest.name);
		expect(result.surname).toEqual(userTest.surname);
		expect(result.role).toEqual(userTest.role);
	});

	it('Should not be able to find a nonexistent user profile', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(profileUserService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(USER_ERRORS.not_exist)
		);
	});
});
