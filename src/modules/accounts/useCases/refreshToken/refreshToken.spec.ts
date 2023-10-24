import auth from '@config/auth';
import { AUTHENTICATION_ERRORS } from '@modules/accounts/errors/authentication.errors';
import { UsersTokensRepositoryInMemory } from '@modules/accounts/repositories/inMemory/UsersTokens.repository';
import { DayjsDateProvider } from '@shared/container/providers/date/implementations/DayjsDateProvider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/Jsonwebtoken.provider';
import AppError from '@shared/errors/AppError';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { RefreshTokenService } from './RefreshToken.service';

let usersTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
let refreshTokenService: RefreshTokenService;
let dateProvider: DayjsDateProvider;
let jwtProvider: JsonwebtokenProvider;

// test constants
const email = 'user@test.com';
const user_id = new ObjectId().toString();
let refresh_token: string;
let expires_date: Date;
let invalid_refresh_token: string;

describe('Refresh token', () => {
	beforeEach(() => {
		usersTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
		dateProvider = new DayjsDateProvider();
		jwtProvider = new JsonwebtokenProvider();
		refreshTokenService = new RefreshTokenService(usersTokensRepositoryInMemory, dateProvider, jwtProvider);

		// test constants
		refresh_token = jwtProvider.createRefreshToken({
			sign_property: email,
			subject: user_id,
			secret: auth.secret_refresh_token,
			expires_in: auth.expires_in_refresh_token
		});
		expires_date = dateProvider.addDays(auth.expires_refresh_token_days);

		invalid_refresh_token = jwtProvider.createRefreshToken({
			sign_property: email,
			subject: user_id,
			secret: 'incorrect secret refresh token',
			expires_in: auth.expires_in_refresh_token
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
			new AppError(AUTHENTICATION_ERRORS.invalid_token, 401)
		);
	});

	it('Should not be able to use a nonexistent refresh token', async () => {
		await expect(refreshTokenService.execute({ token: refresh_token })).rejects.toEqual(
			new AppError(AUTHENTICATION_ERRORS.not_exist_refresh_token)
		);
	});
});
