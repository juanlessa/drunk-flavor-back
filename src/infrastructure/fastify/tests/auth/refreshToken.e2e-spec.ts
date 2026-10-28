import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { env } from '@/env';
import { Roles } from '@/shared/accessControl/roles';

type ErrorResponseBody = { localeKey: string };

describe('Refresh Token', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		vi.useFakeTimers({ toFake: ['Date'] });

		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('refreshes a current session and rejects it after its version changes', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.partner });

		vi.advanceTimersByTime(env.ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		const currentResponse = await request(app.server).post('/refresh-token').set('Cookie', cookies).send();
		expect(currentResponse.status).toBe(HTTP_STATUS.ok);

		await UserModel.findByIdAndUpdate(user.id, { $inc: { session_version: 1 } }).exec();

		const revokedResponse = await request(app.server).post('/refresh-token').set('Cookie', cookies).send();
		expect(revokedResponse.status).toBe(HTTP_STATUS.unauthorized);
		expect((revokedResponse.body as ErrorResponseBody).localeKey).toBe('apiResponses.auth.sessionRevoked');
	});
});
