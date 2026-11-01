import { beforeEach, describe, expect, it } from 'vitest';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { FindUserByIdService } from './FindUserById.service';

let usersRepository: UsersRepositoryInMemory;
let service: FindUserByIdService;

describe('Find User By Id', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new FindUserByIdService(usersRepository);
	});

	it('finds and returns a domain user by id', async () => {
		const user = await usersRepository.create(createUserFactory());

		await expect(service.execute({ userId: user.id })).resolves.toEqual(user);
	});

	it('returns null when the user does not exist', async () => {
		await expect(service.execute({ userId: 'missing-user' })).resolves.toBeNull();
	});
});
