import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppError from '@errors/AppError';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/JsonwebtokenProvider';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/BcryptProvider';
import { AuthenticateUserService } from './AuthenticateUserService';
import { IUser } from '@modules/accounts/dtos/UsersDTO';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';

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

describe('Authenticate User', () => {
	beforeEach(() => {
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
	});

	it('should be able to authenticate an user', async () => {
		const planPassword = '123456789';
		const encryptedPassword = await bcryptProvider.hash(planPassword);
		const userTest: IUser = {
			id: '6461655e42134e25c583f4ed',
			email: 'user@test.com',
			password: encryptedPassword,
			name: 'User'
		};
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(userTest));

		const result = await authenticateUserService.execute({
			email: userTest.email,
			password: planPassword
		});

		expect(result).toHaveProperty('token');
		expect(result).toHaveProperty('refresh_token');
	});

	it('should not be able to authenticate an nonexistent user', async () => {
		const userTest: IUser = null as IUser;
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(userTest));

		await expect(
			authenticateUserService.execute({
				email: 'false@email.com',
				password: '123456789'
			})
		).rejects.toEqual(new AppError('Email or password incorrect!'));
	});

	it('should not be able to authenticate with incorrect password', async () => {
		const planPassword = '123456789';
		const encryptedPassword = await bcryptProvider.hash(planPassword);
		const userTest: IUser = {
			id: '6461655e42134e25c583f4ed',
			email: 'user@test.com',
			password: encryptedPassword,
			name: 'User'
		};
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(userTest));

		await expect(
			authenticateUserService.execute({
				email: userTest.email,
				password: 'incorrectPassword'
			})
		).rejects.toEqual(new AppError('Email or password incorrect!'));
	});
});
