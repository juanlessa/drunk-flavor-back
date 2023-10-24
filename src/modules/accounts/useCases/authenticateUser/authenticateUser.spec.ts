import AppError from '@errors/AppError';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/Users.repository';
import { UsersTokensRepositoryInMemory } from '@modules/accounts/repositories/inMemory/UsersTokens.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/Jsonwebtoken.provider';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthenticateUserService } from './AuthenticateUser.service';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let usersTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
let authenticateUserService: AuthenticateUserService;
let dateProvider: DayjsDateProvider;
let jwtProvider: JsonwebtokenProvider;
let encryptionProvider: BcryptProvider;

// test constants
const email = 'user@test.com';
const name = 'User';
const surname = 'Test';
const planPassword = '123456789';

describe('Authenticate User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		usersTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
		dateProvider = new DayjsDateProvider();
		jwtProvider = new JsonwebtokenProvider();
		encryptionProvider = new BcryptProvider();
		authenticateUserService = new AuthenticateUserService(
			usersRepositoryInMemory,
			usersTokensRepositoryInMemory,
			dateProvider,
			jwtProvider,
			encryptionProvider
		);
	});

	it('should be able to authenticate an user', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await encryptionProvider.hash(planPassword),
			role: ROLES.partner
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
		).rejects.toEqual(new AppError(AUTHENTICATION_ERRORS.invalid_credentials));
	});

	it('should not be able to authenticate an user with incorrect password', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await encryptionProvider.hash(planPassword),
			role: ROLES.partner
		});

		await expect(
			authenticateUserService.execute({
				email: email,
				password: 'incorrectPassword'
			})
		).rejects.toEqual(new AppError(AUTHENTICATION_ERRORS.invalid_credentials));
	});
});
