import AppError from '@errors/AppError';
import User from '@modules/accounts/entities/User';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/BcryptProvider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/JsonwebtokenProvider';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticateUserService } from './AuthenticateUserService';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/UsersRepository';
import { UsersTokensRepositoryInMemory } from '@modules/accounts/repositories/inMemory/UsersTokensRepository';
import { ICreateUser } from '@modules/accounts/dtos/Users';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let usersTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
let authenticateUserService: AuthenticateUserService;
let dayjsDateProvider: DayjsDateProvider;
let jsonwebtokenProvider: JsonwebtokenProvider;
let bcryptProvider: BcryptProvider;

// test constants
const email = 'user@test.com';
const name = 'User';
const surname = 'Test';
const planPassword = '123456789';
let encryptedPassword: string;
let userTest: ICreateUser;

describe('Authenticate User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		usersTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
		dayjsDateProvider = new DayjsDateProvider();
		jsonwebtokenProvider = new JsonwebtokenProvider();
		bcryptProvider = new BcryptProvider();
		authenticateUserService = new AuthenticateUserService(
			usersRepositoryInMemory,
			usersTokensRepositoryInMemory,
			dayjsDateProvider,
			jsonwebtokenProvider,
			bcryptProvider
		);
	});

	it('should be able to authenticate an user', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await bcryptProvider.hash(planPassword)
		});

		const result = await authenticateUserService.execute({
			email: email,
			password: planPassword
		});

		expect(result).toHaveProperty('token');
		expect(result).toHaveProperty('refresh_token');
	});

	it('should not be able to authenticate an nonexistent user', async () => {
		await expect(
			authenticateUserService.execute({
				email,
				password: planPassword
			})
		).rejects.toEqual(new AppError('Email or password incorrect'));
	});

	it('should not be able to authenticate an user with incorrect password', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await bcryptProvider.hash(planPassword)
		});

		await expect(
			authenticateUserService.execute({
				email: email,
				password: 'incorrectPassword'
			})
		).rejects.toEqual(new AppError('Email or password incorrect'));
	});
});
