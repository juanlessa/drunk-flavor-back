import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { Roles } from '@/shared/accessControl/roles';

describe('Get User', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to admin get the User', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });

		const { id } = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const response = await request(app.server).get(`/users/${id}`).set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});

	it('Should not be able to get a user when unauthenticated', async () => {
		const { id } = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const response = await request(app.server).get(`/users/${id}`).send();

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});
});
