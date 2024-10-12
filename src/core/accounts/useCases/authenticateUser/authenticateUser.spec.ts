import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { AuthenticateUserService } from '@/core/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { createUserFactory } from '../../factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';

let usersRepositoryInMemory: IUsersRepository;
let hashProvider: IHashProvider;
let service: AuthenticateUserService;

const { name, surname, email, password, role } = createUserFactory();

describe('Authenticate User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		service = new AuthenticateUserService(usersRepositoryInMemory, hashProvider);
	});

	it('should be able to authenticate a user', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await hashProvider.hash(password),
			role,
		});

		const result = await service.execute({
			email,
			password,
		});

		expect(result).toHaveProperty('user');
	});

	it('should not be able to authenticate an nonexistent user', async () => {
		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to authenticate a user with incorrect password', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await hashProvider.hash(password),
			role: role,
		});

		await expect(service.execute({ email: email, password: 'incorrectPassword' })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});
});
