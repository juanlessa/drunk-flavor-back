import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { env } from '@/env';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('Refresh Token', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		vi.useFakeTimers();

		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('Should be able to refresh an expired access token', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.partner });

		vi.advanceTimersByTime(env.ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		const response = await request(app.server).post('/refresh-token').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});
});
