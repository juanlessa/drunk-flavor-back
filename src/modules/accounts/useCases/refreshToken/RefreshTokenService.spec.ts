import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RefreshTokenService } from './RefreshTokenService';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import AppError from '@shared/errors/AppError';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/JsonwebtokenProvider';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import auth from '@config/auth';
import { IUserToken } from '@modules/accounts/dtos/UsersTokensDTO';

const usersTokensRepositoryMock = vi.hoisted<IUsersTokensRepository>(() => {
	return {
		create: vi.fn(),
		findByUserIdAndRefreshToken: vi.fn()
	};
});
let refreshTokenService: RefreshTokenService;
let dayjsDateProvider: DayjsDateProvider;
let jsonwebtokenProvider: JsonwebtokenProvider;

describe('Refresh token', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		dayjsDateProvider = new DayjsDateProvider();
		jsonwebtokenProvider = new JsonwebtokenProvider();
		refreshTokenService = new RefreshTokenService(
			usersTokensRepositoryMock,
			dayjsDateProvider,
			jsonwebtokenProvider
		);
	});

	it('Should be able to refresh the token', async () => {
		const email = 'user@test.com';
		const id = 'userId000a0000000a000000';
		const refresh_token = jsonwebtokenProvider.createRefreshToken({
			userEmail: email,
			userId: id,
			secret: auth.secret_refresh_token,
			expiresIn: auth.expires_in_refresh_token
		});
		const expires_date = dayjsDateProvider.addDays(auth.expires_refresh_token_days);
		const testUserToken = {
			id: 'userTokenId0000000000000',
			user_id: id,
			expires_date: expires_date,
			refresh_token: refresh_token
		};
		vi.mocked(usersTokensRepositoryMock.findByUserIdAndRefreshToken).mockReturnValue(
			Promise.resolve(testUserToken)
		);

		const result = await refreshTokenService.execute({
			token: refresh_token
		});

		expect(usersTokensRepositoryMock.findByUserIdAndRefreshToken).toHaveBeenCalledTimes(1);
		expect(usersTokensRepositoryMock.findByUserIdAndRefreshToken).toHaveBeenCalledWith(id, refresh_token);
		expect(result).toHaveProperty('token');
	});

	it('Should not be able to refresh a invalid token', async () => {
		const email = 'user@test.com';
		const id = 'userId000a0000000a000000';
		const invalid_refresh_token = jsonwebtokenProvider.createRefreshToken({
			userEmail: email,
			userId: id,
			secret: 'incorrect secret refresh token',
			expiresIn: auth.expires_in_refresh_token
		});

		await expect(refreshTokenService.execute({ token: invalid_refresh_token })).rejects.toEqual(
			new AppError('Invalid token!', 401)
		);
	});

	it('Should not be to use a inexistent refresh token', async () => {
		const email = 'user@test.com';
		const id = 'userId000a0000000a000000';
		const refresh_token = jsonwebtokenProvider.createRefreshToken({
			userEmail: email,
			userId: id,
			secret: auth.secret_refresh_token,
			expiresIn: auth.expires_in_refresh_token
		});
		const invalidUserToken = null as IUserToken;
		vi.mocked(usersTokensRepositoryMock.findByUserIdAndRefreshToken).mockReturnValue(
			Promise.resolve(invalidUserToken)
		);

		await expect(refreshTokenService.execute({ token: refresh_token })).rejects.toEqual(
			new AppError('Refresh Token does not exists!')
		);
	});
});
