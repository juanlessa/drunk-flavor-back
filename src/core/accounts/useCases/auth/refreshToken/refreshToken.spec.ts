import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { RefreshTokenService } from './RefreshToken.service';

let usersRepository: IUsersRepository;
let service: RefreshTokenService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('Refresh Tokem', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new RefreshTokenService(usersRepository);
	});

	it('should be able to find an existing user to refresh their token', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });

		const result = await service.execute({ user_id: createdUser._id.toString() });

		expect(result._id).toEqual(createdUser._id);
		expect(result.role).toEqual(createdUser.role);
	});

	it('should not be able to find a non-existent user to refresh their token', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ user_id: nonexistentId })).rejects.toBeInstanceOf(NotFoundError);
	});
});
