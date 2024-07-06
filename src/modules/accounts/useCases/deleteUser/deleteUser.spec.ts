import { beforeEach, describe, expect, it } from 'vitest';
import { UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { CreateUser } from '@/modules/accounts/dtos/user.dtos';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { DeleteUserService } from './DeleteUser.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';

let usersRepositoryInMemory: IUsersRepository;
let service: DeleteUserService;

// test constants
const planPassword = '123456789';
const email = 'user@/test.com';
const name = 'User';
const surname = 'Test';
const role = UserRolesEnum.admin;
let createTestUser: CreateUser = {
	name,
	surname,
	role,
	email,
	password: planPassword,
};
describe('Delete User', () => {
	beforeEach(() => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new DeleteUserService(usersRepositoryInMemory);
	});

	it('should be able to delete an user', async () => {
		const createdUser = await usersRepositoryInMemory.create(createTestUser);

		await service.execute({ id: createdUser._id.toString() });

		const findDeledUser = await usersRepositoryInMemory.findById(createdUser._id.toString());

		expect(findDeledUser).toBeNull();
	});

	it('should not be able to delete a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
