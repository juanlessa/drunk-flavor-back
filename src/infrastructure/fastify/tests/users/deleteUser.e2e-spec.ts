import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { TokenModel } from '@/core/accounts/infra/mongo/entities/token.model';
import { Roles } from '@/shared/accessControl/roles';

describe('Delete User', () => {
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

	it('Should be able to admin delete a user', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });

		const userToDelete = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const response = await request(app.server)
			.delete('/users')
			.set('Cookie', cookies)
			.send({ id: userToDelete.id });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});

	it('Should not be able to delete a user when unauthenticated', async () => {
		const userToDelete = await createUser(app, { email: 'partner@example.com', role: Roles.partner });

		const response = await request(app.server).delete('/users').send({ id: userToDelete.id });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});
});
