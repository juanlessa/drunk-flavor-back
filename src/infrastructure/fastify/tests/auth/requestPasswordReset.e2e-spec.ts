import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createUser } from '../helpers/authentication.helpers';
import { TokenModel } from '@/core/accounts/infra/mongo/entities/token.model';
import { Roles } from '@/shared/accessControl/roles';

describe('Request Password Reset', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(TokenModel);
	});

	it('Should be able to request a password reset', async () => {
		const { email } = await createUser(app, { role: Roles.member });

		const response = await request(app.server).post('/password-reset/request').send({ email });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
