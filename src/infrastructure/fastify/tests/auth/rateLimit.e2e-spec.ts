import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { createUser } from '../helpers/authentication.helpers';
import { RolesEnum } from '@/shared/accessControl/roles';
import { RATE_LIMIT_KEY_PREFIX } from '@/infrastructure/redis/RedisRateLimit.store';

interface ErrorBody {
	ok: boolean;
	localeKey: string;
	message: string;
}

const LOCALE_KEY = 'apiResponses.auth.tooManyRequests';
const INVALID_CREDENTIALS_KEY = 'apiResponses.auth.invalidCredentials';

// These mirror the inline limits declared on the auth routes (auth.routes.ts).
const SIGNIN_MAX = 5;
const RESET_MAX = 5;
const BAN = 10;

const WRONG_PASSWORD = 'Wrong-Password-123';

describe('Auth rate limiting', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await resolveRateLimitStore().reset();
	});

	describe('signin (hook model: failed-only, no ban)', () => {
		it('does not consume the limit on successful logins', async () => {
			const user = await createUser(app, { role: RolesEnum.member });

			for (let attempt = 0; attempt < SIGNIN_MAX + 3; attempt += 1) {
				const response = await request(app.server).post('/signin').send({
					email: user.email,
					password: user.password,
				});
				expect(response.status).toBe(HTTP_STATUS.ok);
			}
		});

		it('counts only failed attempts and returns 429 with the API body once exceeded', async () => {
			const user = await createUser(app, { role: RolesEnum.member });

			for (let attempt = 0; attempt < SIGNIN_MAX + 1; attempt += 1) {
				const response = await request(app.server).post('/signin').send({
					email: user.email,
					password: WRONG_PASSWORD,
				});
				expect(response.status).toBe(HTTP_STATUS.unauthorized);
				expect((response.body as ErrorBody).localeKey).toBe(INVALID_CREDENTIALS_KEY);
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

		it('stays at 429 and never escalates to a ban', async () => {
			const user = await createUser(app, { role: RolesEnum.member });

			const statuses: number[] = [];
			for (let attempt = 0; attempt < SIGNIN_MAX + BAN + 3; attempt += 1) {
				const response = await request(app.server).post('/signin').send({
					email: user.email,
					password: WRONG_PASSWORD,
				});
				statuses.push(response.status);
			}

			expect(statuses).toContain(HTTP_STATUS.too_many_requests);
			expect(statuses).not.toContain(HTTP_STATUS.forbidden);
		});
	});

	describe('native model (every request counts, escalates to ban)', () => {
		it('returns 429 with the API body and Retry-After once the limit is exceeded', async () => {
			const email = 'reset-target@example.com';

			for (let attempt = 0; attempt < RESET_MAX; attempt += 1) {
				const response = await request(app.server).post('/password-reset/request').send({ email });
				expect(response.status).not.toBe(HTTP_STATUS.too_many_requests);
			}

			const limited = await request(app.server).post('/password-reset/request').send({ email });
			expect(limited.status).toBe(HTTP_STATUS.too_many_requests);
			expect(limited.body as ErrorBody).toMatchObject({ ok: false, localeKey: LOCALE_KEY });
			expect(limited.headers['retry-after']).toBeDefined();
		});

		it('escalates to 403 once the ban threshold of repeated 429s is crossed', async () => {
			const email = 'ban-target@example.com';

			const statuses: number[] = [];
			for (let attempt = 0; attempt < RESET_MAX + BAN + 3; attempt += 1) {
				const response = await request(app.server).post('/password-reset/request').send({ email });
				statuses.push(response.status);
			}

			expect(statuses).toContain(HTTP_STATUS.too_many_requests);
			expect(statuses).toContain(HTTP_STATUS.forbidden);
			expect(statuses.at(-1)).toBe(HTTP_STATUS.forbidden);
		});
	});

	it('namespaces its keys under the configured prefix', async () => {
		const user = await createUser(app, { role: RolesEnum.member });
		await request(app.server).post('/signin').send({ email: user.email, password: WRONG_PASSWORD });

		const removed = await RedisConnection.Instance.deleteKeysByPattern(`${RATE_LIMIT_KEY_PREFIX}*`);
		expect(removed).toBeGreaterThan(0);
	});
});
