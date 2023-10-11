import AppError from '@errors/AppError';
import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteUserService } from './DeleteUser.service';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let deleteUserService: DeleteUserService;

// test constants
const planPassword = '123456789';
const email = 'user@test.com';
const name = 'User';
const surname = 'Test';
const role = ROLES.admin;
let createTestUser: ICreateUser = {
	name,
	surname,
	role,
	email,
	password: planPassword
};
describe('Delete User', () => {
	beforeEach(() => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		deleteUserService = new DeleteUserService(usersRepositoryInMemory);
	});

	it('should be able to delete an user', async () => {
		const createdUser = await usersRepositoryInMemory.create(createTestUser);

		await deleteUserService.execute({ id: createdUser._id });

		const findDeledUser = await usersRepositoryInMemory.findById(createdUser._id);

		expect(findDeledUser).toBeUndefined();
	});

	it('should not be able to delete a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteUserService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(USER_ERRORS.not_exist)
		);
	});
});
