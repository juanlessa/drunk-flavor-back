import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { RefreshTokenService } from './RefreshToken.service';

let usersRepository: IUsersRepository;
let service: RefreshTokenService;

const { name, surname, email, role, status } = createUserFactory();

describe('Refresh Tokem', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new RefreshTokenService(usersRepository);
	});

	it('should be able to find an existing user to refresh their token', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });

		const result = await service.execute({
			userId: createdUser.id,
			sessionVersion: createdUser.sessionVersion,
		});

		expect(result.id).toEqual(createdUser.id);
		expect(result.role).toEqual(createdUser.role);

		await usersRepository.update({ id: createdUser.id, sessionVersion: createdUser.sessionVersion + 1 });
		await expect(
			service.execute({ userId: createdUser.id, sessionVersion: createdUser.sessionVersion }),
		).rejects.toBeInstanceOf(SessionRevokedError);
	});

	it('should not be able to find a non-existent user to refresh their token', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ userId: nonexistentId, sessionVersion: 1 })).rejects.toBeInstanceOf(
			SessionRevokedError,
		);
	});
});
