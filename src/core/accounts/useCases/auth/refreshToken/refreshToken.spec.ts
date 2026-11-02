import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { RefreshTokenService } from './RefreshToken.service';

let usersRepository: IUsersRepository;
let service: RefreshTokenService;

describe('Refresh Token', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		service = new RefreshTokenService(usersRepository);
	});

	it('returns the current session of an existing user', async () => {
		const createdUser = await usersRepository.create(createUserFactory());

		const result = await service.execute({
			userId: createdUser.id,
			sessionVersion: createdUser.sessionVersion,
		});

		expect(result.id).toEqual(createdUser.id);
		expect(result.role).toEqual(createdUser.role);
	});

	it('rejects a session whose version changed', async () => {
		const createdUser = await usersRepository.create(createUserFactory());
		await usersRepository.incrementSessionVersion(createdUser.id);

		await expect(
			service.execute({ userId: createdUser.id, sessionVersion: createdUser.sessionVersion }),
		).rejects.toBeInstanceOf(SessionRevokedError);
	});

	it('rejects a missing user', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ userId: nonexistentId, sessionVersion: 1 })).rejects.toBeInstanceOf(
			SessionRevokedError,
		);
	});
});
