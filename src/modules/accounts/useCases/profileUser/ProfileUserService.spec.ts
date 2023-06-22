import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/UsersRepository';
import AppError from '@shared/errors/AppError';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProfileUserService } from './ProfileUserService';
import { ROLES } from '@modules/accounts/types/roles';
import { ObjectId } from 'bson';

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

		const result = await profileUserService.execute(userTest.id);

		expect(result.id).toEqual(userTest.id);
		expect(result.email).toEqual(userTest.email);
		expect(result.name).toEqual(userTest.name);
		expect(result.surname).toEqual(userTest.surname);
		expect(result.role).toEqual(userTest.role);
	});

	it('Should not be able to find a nonexistent user profile', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(profileUserService.execute(nonexistentId)).rejects.toEqual(new AppError('User does not exists'));
	});
});
