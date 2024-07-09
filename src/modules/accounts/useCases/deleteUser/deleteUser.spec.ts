import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { DeleteUserService } from './DeleteUser.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/modules/accounts/container';

let usersRepositoryInMemory: IUsersRepository;
let service: DeleteUserService;

const userData = createUserFactory();

describe('Delete User', () => {
	beforeEach(() => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		service = new DeleteUserService(usersRepositoryInMemory);
	});

	it('should be able to delete a user', async () => {
		const createdUser = await usersRepositoryInMemory.create(userData);

		await service.execute({ id: createdUser._id.toString() });

		const findDeledUser = await usersRepositoryInMemory.findById(createdUser._id.toString());

		expect(findDeledUser).toBeNull();
	});

	it('should not be able to delete a nonexistent user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
