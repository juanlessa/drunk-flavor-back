import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { Roles } from '@/shared/accessControl/roles';

describe('Update User Role', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to admin update the role of a user', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });

		const userToUpdate = await createUser(app, { email: 'partner@example.com', role: Roles.member });

		const response = await request(app.server).patch('/users/role').set('Cookie', cookies).send({
			user_id: userToUpdate.id,
			role: Roles.partner,
		});

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});

	it('Should not be able to update a user role when unauthenticated', async () => {
		const userToUpdate = await createUser(app, { email: 'member@example.com', role: Roles.member });

		const response = await request(app.server).patch('/users/role').send({
			user_id: userToUpdate.id,
			role: Roles.partner,
		});

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});
});
