import AppError from '@errors/AppError';
import { IUser } from '@modules/accounts/dtos/UsersDTO';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/BcryptProvider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/JsonwebtokenProvider';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticateUserService } from './AuthenticateUserService';

const usersRepositoryMock = vi.hoisted<IUsersRepository>(() => {
	return {
		create: vi.fn(),
		update: vi.fn(),
		findByEmail: vi.fn(),
		findById: vi.fn()
	};
});

const usersTokensRepositoryMock = vi.hoisted<IUsersTokensRepository>(() => {
	return {
		create: vi.fn(),
		findByUserIdAndRefreshToken: vi.fn()
	};
});

let authenticateUserService: AuthenticateUserService;
let dayjsDateProvider: DayjsDateProvider;
let jsonwebtokenProvider: JsonwebtokenProvider;
let bcryptProvider: BcryptProvider;

// test constants
const id = '6461655e42134e25c583f4ed';
const email = 'user@test.com';
const name = 'User';
const planPassword = '123456789';
const invalidUserTest: IUser = null as IUser;
let encryptedPassword: string;
let userTest: IUser;

describe('Authenticate User', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		dayjsDateProvider = new DayjsDateProvider();
		jsonwebtokenProvider = new JsonwebtokenProvider();
		bcryptProvider = new BcryptProvider();
		authenticateUserService = new AuthenticateUserService(
			usersRepositoryMock,
			usersTokensRepositoryMock,
			dayjsDateProvider,
			jsonwebtokenProvider,
			bcryptProvider
		);

		// test constants
		encryptedPassword = await bcryptProvider.hash(planPassword);
		userTest = {
			id,
			email,
			password: encryptedPassword,
			name
		};
	});

	it('should be able to authenticate an user', async () => {
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(userTest));

		const result = await authenticateUserService.execute({
			email: email,
			password: planPassword
		});

		expect(result).toHaveProperty('token');
		expect(result).toHaveProperty('refresh_token');
	});

	it('should not be able to authenticate an nonexistent user', async () => {
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(invalidUserTest));

		await expect(
			authenticateUserService.execute({
				email: 'false@email.com',
				password: '123456789'
			})
		).rejects.toEqual(new AppError('Email or password incorrect!'));
	});

	it('should not be able to authenticate with incorrect password', async () => {
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(userTest));

		await expect(
			authenticateUserService.execute({
				email: email,
				password: 'incorrectPassword'
			})
		).rejects.toEqual(new AppError('Email or password incorrect!'));
	});
});
