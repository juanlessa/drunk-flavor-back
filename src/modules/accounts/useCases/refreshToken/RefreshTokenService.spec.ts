import auth from '@config/auth';
import { UsersTokensRepositoryInMemory } from '@modules/accounts/repositories/inMemory/UsersTokensRepository';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/JsonwebtokenProvider';
import AppError from '@shared/errors/AppError';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { RefreshTokenService } from './RefreshTokenService';

let usersTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
let refreshTokenService: RefreshTokenService;
let dayjsDateProvider: DayjsDateProvider;
let jsonwebtokenProvider: JsonwebtokenProvider;

// test constants
const email = 'user@test.com';
const user_id = new ObjectId().toString();
let refresh_token: string;
let expires_date: Date;
let invalid_refresh_token: string;

describe('Refresh token', () => {
	beforeEach(() => {
		usersTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
		dayjsDateProvider = new DayjsDateProvider();
		jsonwebtokenProvider = new JsonwebtokenProvider();
		refreshTokenService = new RefreshTokenService(
			usersTokensRepositoryInMemory,
			dayjsDateProvider,
			jsonwebtokenProvider
		);

		// test constants
		refresh_token = jsonwebtokenProvider.createRefreshToken({
			userEmail: email,
			userId: user_id,
			secret: auth.secret_refresh_token,
			expiresIn: auth.expires_in_refresh_token
		});
		expires_date = dayjsDateProvider.addDays(auth.expires_refresh_token_days);

		invalid_refresh_token = jsonwebtokenProvider.createRefreshToken({
			userEmail: email,
			userId: user_id,
			secret: 'incorrect secret refresh token',
			expiresIn: auth.expires_in_refresh_token
		});
	});

	it('Should be able to refresh the token', async () => {
		await usersTokensRepositoryInMemory.create({
			user_id,
			expires_date,
			refresh_token
		});

		const result = await refreshTokenService.execute({
			token: refresh_token
		});

		expect(result).toHaveProperty('token');
	});

	it('Should not be able to refresh a invalid token', async () => {
		await expect(refreshTokenService.execute({ token: invalid_refresh_token })).rejects.toEqual(
			new AppError('Invalid token', 401)
		);
	});

	it('Should not be able to use a nonexistent refresh token', async () => {
		await expect(refreshTokenService.execute({ token: refresh_token })).rejects.toEqual(
			new AppError('Refresh Token does not exists')
		);
	});
});
