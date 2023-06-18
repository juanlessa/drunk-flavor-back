import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/UsersRepository';
import AppError from '@shared/errors/AppError';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProfileUserService } from './ProfileUserService';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let profileUserService: ProfileUserService;

// test constants
const email = 'user@test.com';
const password = '123456789';
const name = 'User';
const surname = 'Test';

describe('User Profile', () => {
	beforeEach(() => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		profileUserService = new ProfileUserService(usersRepositoryInMemory);
	});

	it('should be able to find a user profile', async () => {
		await usersRepositoryInMemory.create({ name, surname, email, password });
		const userTest = await usersRepositoryInMemory.findByEmail(email);

		const result = await profileUserService.execute(userTest.id);

		expect(result.id).toEqual(userTest.id);
		expect(result.email).toEqual(userTest.email);
		expect(result.name).toEqual(userTest.name);
		expect(result.surname).toEqual(userTest.surname);
	});

	it('Should not be able to find a nonexistent user profile', async () => {
		await expect(profileUserService.execute('invalidId')).rejects.toEqual(new AppError('User does not exists'));
	});
});
