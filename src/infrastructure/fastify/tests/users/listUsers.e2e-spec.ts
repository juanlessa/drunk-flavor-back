import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { Roles } from '@/shared/accessControl/roles';

describe('List Users', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to admin list users', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });

		await createUser(app, { email: 'partner1@example.com', role: Roles.partner });
		await createUser(app, { email: 'member1@example.com', role: Roles.member });

		const response = await request(app.server).get('/users').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});

	it('Should respect the limit and never expose the password when paginating', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });

		await createUser(app, { email: 'partner1@example.com', role: Roles.partner });
		await createUser(app, { email: 'partner2@example.com', role: Roles.partner });
		await createUser(app, { email: 'member1@example.com', role: Roles.member });

		const response = await request(app.server).get('/users?limit=1&page=1').set('Cookie', cookies).send();
		const users = response.body as Array<Record<string, unknown>>;

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(Array.isArray(users)).toBe(true);
		expect(users.length).toBe(1);
		for (const user of users) {
			expect(user).not.toHaveProperty('password');
		}
	});

	it('Should not be able to list the users when unauthenticated', async () => {
		const response = await request(app.server).get('/users').send();

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});

	it('Should not be able to list the users as a member', async () => {
		const { cookies } = await createAndAuthenticateUser(app, {
			email: 'member@example.com',
			role: Roles.member,
		});

		const response = await request(app.server).get('/users').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.forbidden);
	});

	it('Should not be able to list the users as a partner', async () => {
		const { cookies } = await createAndAuthenticateUser(app, {
			email: 'partner@example.com',
			role: Roles.partner,
		});

		const response = await request(app.server).get('/users').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.forbidden);
	});
});
