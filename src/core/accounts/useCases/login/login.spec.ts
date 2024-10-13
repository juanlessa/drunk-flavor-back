import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { createUserFactory } from '../../factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { LoginService } from './Login.service';
import { UserStatusEnum } from '../../entities/user.entity';

let usersRepositoryInMemory: IUsersRepository;
let hashProvider: IHashProvider;
let service: LoginService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('Login', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		service = new LoginService(usersRepositoryInMemory, hashProvider);
	});

	it('should be able to login', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await hashProvider.hash(password),
			role,
			status,
		});

		const result = await service.execute({
			email,
			password,
		});

		expect(result).toHaveProperty('user');
	});

	it('should not be able to login an nonexistent account', async () => {
		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to login a non-active account', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			password: await hashProvider.hash(password),
			status: UserStatusEnum['pending'],
		});

		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to login an account with incorrect password', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			status,
			password: await hashProvider.hash(password),
		});

		await expect(service.execute({ email, password: 'incorrectPassword' })).rejects.toBeInstanceOf(BadRequestError);
	});
});
