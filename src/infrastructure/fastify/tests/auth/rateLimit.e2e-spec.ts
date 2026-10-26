import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { createUser } from '../helpers/authentication.helpers';
import { Roles } from '@/shared/accessControl/roles';

interface ErrorBody {
	ok: boolean;
	localeKey: string;
	message: string;
}

const LOCALE_KEY = 'apiResponses.auth.tooManyRequests';

const SIGNIN_MAX = 5;

const WRONG_PASSWORD = 'Wrong-Password-123';

describe('Auth rate limiting', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await resolveRateLimitStore().reset();
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await resolveRateLimitStore().reset();
	});

	it('Should return a 429 with the API body and Retry-After once the signin limit is exceeded', async () => {
		const user = await createUser(app, { role: Roles.member });

		for (let attempt = 0; attempt < SIGNIN_MAX + 1; attempt += 1) {
			await request(app.server).post('/signin').send({ email: user.email, password: WRONG_PASSWORD });
		}

		const limited = await request(app.server).post('/signin').send({
			email: user.email,
			password: WRONG_PASSWORD,
		});

		expect(limited.status).toBe(HTTP_STATUS.too_many_requests);
		expect(limited.body as ErrorBody).toMatchObject({ ok: false, localeKey: LOCALE_KEY });
		expect(typeof (limited.body as ErrorBody).message).toBe('string');
		expect(limited.headers['retry-after']).toBeDefined();
	});
});
