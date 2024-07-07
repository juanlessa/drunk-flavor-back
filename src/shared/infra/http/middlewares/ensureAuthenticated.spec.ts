import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRequest, createResponse } from 'node-mocks-http';
import { ensureAuthenticated } from './ensureAuthenticated';
import { IJwtProvider } from '@shared/container/providers/jwt/IJwt.provider';
import { JsonwebtokenProvider } from '@shared/container/providers/jwt/implementations/Jsonwebtoken.provider';
import { ObjectId } from 'bson';
import { authConfig } from '@config/auth';
import { ForbiddenError, NotFoundError } from '@shared/errors/error.lib';
import { DayjsDateProvider } from '@/shared/container/providers/date/implementations/DayjsDateProvider';
import { IDateProvider } from '@/shared/container/providers/date/IDateProvider';

let jwtProvider: IJwtProvider;
let dateProvider: IDateProvider;

const userId = new ObjectId().toString();

describe('Ensure Authenticated', () => {
	beforeEach(() => {
		jwtProvider = new JsonwebtokenProvider();
		dateProvider = new DayjsDateProvider();

		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('Should be able to ensure authenticated', async () => {
		const accessToken = jwtProvider.createToken({
			subject: userId,
			secret: authConfig.ACCESS_TOKEN_SECRET,
			expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
		});
		const refreshToken = jwtProvider.createToken({
			subject: '',
			secret: authConfig.REFRESH_TOKEN_SECRET,
			expires_in: authConfig.REFRESH_TOKEN_EXPIRES_IN
		});

		const next = vi.fn();
		const response = createResponse();
		const request = createRequest({
			method: 'GET',
			url: '/test',
			cookies: { authorization: accessToken },
			session: { refreshToken: { refreshToken, userId } }
		});

		await ensureAuthenticated(request, response, next);

		expect(next).toHaveBeenCalledWith();
		expect(request.user.id).toEqual(userId);
		expect(response.cookies.authorization.value).toEqual(accessToken);
	});

	it('Should not be able authenticate without an access token', async () => {
		const next = vi.fn();
		const response = createResponse();
		const request = createRequest({
			method: 'GET',
			url: '/test'
		});

		await expect(ensureAuthenticated(request, response, next)).rejects.toBeInstanceOf(NotFoundError);
	});

	it('Should not be able to use an invalid access token', async () => {
		const accessToken = jwtProvider.createToken({
			subject: userId,
			secret: 'invalid-secret',
			expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
		});

		const next = vi.fn();
		const response = createResponse();
		const request = createRequest({
			method: 'GET',
			url: '/test',
			cookies: { authorization: accessToken }
		});

		await expect(ensureAuthenticated(request, response, next)).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('Should not be able to use an access token without user id subject', async () => {
		const accessToken = jwtProvider.createToken({
			subject: '',
			secret: authConfig.ACCESS_TOKEN_SECRET,
			expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
		});

		const next = vi.fn();
		const response = createResponse();
		const request = createRequest({
			method: 'GET',
			url: '/test',
			cookies: { authorization: accessToken }
		});

		await expect(ensureAuthenticated(request, response, next)).rejects.toBeInstanceOf(NotFoundError);
	});

	it('Should be able to refresh an expired access token', async () => {
		const accessToken = jwtProvider.createToken({
			subject: userId,
			secret: authConfig.ACCESS_TOKEN_SECRET,
			expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
		});
		const refreshToken = jwtProvider.createToken({
			subject: '',
			secret: authConfig.REFRESH_TOKEN_SECRET,
			expires_in: authConfig.REFRESH_TOKEN_EXPIRES_IN
		});

		const next = vi.fn();
		const response = createResponse();
		const request = createRequest({
			method: 'GET',
			url: '/test',
			cookies: { authorization: accessToken },
			session: { refreshToken: { refreshToken, userId } }
		});

		const accessTokenExpiredDate = dateProvider.addSeconds(authConfig.ACCESS_TOKEN_EXPIRES_IN);
		vi.setSystemTime(accessTokenExpiredDate);

		await ensureAuthenticated(request, response, next);

		expect(next).toHaveBeenCalledWith();
		expect(request.user.id).toEqual(userId);
		expect(response.cookies.authorization.value).toBeDefined();
		expect(response.cookies.authorization.value).not.toEqual(accessToken);
	});

	it('Should not be able to refresh an expired access token without a refresh token session', async () => {
		const accessToken = jwtProvider.createToken({
			subject: userId,
			secret: authConfig.ACCESS_TOKEN_SECRET,
			expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
		});

		const next = vi.fn();
		const response = createResponse();
		const request = createRequest({
			method: 'GET',
			url: '/test',
			cookies: { authorization: accessToken }
		});

		const accessTokenExpiredDate = dateProvider.addSeconds(authConfig.ACCESS_TOKEN_EXPIRES_IN);
		vi.setSystemTime(accessTokenExpiredDate);

		await expect(ensureAuthenticated(request, response, next)).rejects.toBeInstanceOf(NotFoundError);
	});

	it('Should not be able to refresh an expired access token with an invalid refresh token', async () => {
		const accessToken = jwtProvider.createToken({
			subject: userId,
			secret: authConfig.ACCESS_TOKEN_SECRET,
			expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
		});
		const refreshToken = jwtProvider.createToken({
			subject: '',
			secret: 'invalid-reefresh-token-secret',
			expires_in: authConfig.REFRESH_TOKEN_EXPIRES_IN
		});

		const next = vi.fn();
		const response = createResponse();
		const request = createRequest({
			method: 'GET',
			url: '/test',
			cookies: { authorization: accessToken },
			session: { refreshToken: { refreshToken, userId } }
		});

		const accessTokenExpiredDate = dateProvider.addSeconds(authConfig.ACCESS_TOKEN_EXPIRES_IN);
		vi.setSystemTime(accessTokenExpiredDate);

		await expect(ensureAuthenticated(request, response, next)).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('Should not be able to refresh an expired access token with an expired refresh token', async () => {
		const accessToken = jwtProvider.createToken({
			subject: userId,
			secret: authConfig.ACCESS_TOKEN_SECRET,
			expires_in: authConfig.ACCESS_TOKEN_EXPIRES_IN
		});
		const refreshToken = jwtProvider.createToken({
			subject: '',
			secret: authConfig.REFRESH_TOKEN_SECRET,
			expires_in: authConfig.REFRESH_TOKEN_EXPIRES_IN
		});

		const next = vi.fn();
		const response = createResponse();
		const request = createRequest({
			method: 'GET',
			url: '/test',
			cookies: { authorization: accessToken },
			session: { refreshToken: { refreshToken, userId } }
		});

		const refreshTokenExpiredDate = dateProvider.addSeconds(authConfig.REFRESH_TOKEN_EXPIRES_IN);
		vi.setSystemTime(refreshTokenExpiredDate);

		await expect(ensureAuthenticated(request, response, next)).rejects.toBeInstanceOf(ForbiddenError);
	});
});
