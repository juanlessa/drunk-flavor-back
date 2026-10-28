import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { Roles } from '@/shared/accessControl/roles';
import { AUTH_COOKIE } from '@/infrastructure/fastify/constants/cookie.constants';
import { AUTH_SESSION_COOKIE } from '@/infrastructure/fastify/constants/session.constants';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';

type ErrorResponseBody = { localeKey: string };

describe('Update User Role', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(AdministrativeEventModel);
	});

	it('updates a role and immediately revokes a downgraded admin session', async () => {
		const { cookies: adminCookies, user: adminUser } = await createAndAuthenticateUser(app, {
			email: 'admin@example.com',
			role: Roles.admin,
		});
		const userToUpdate = await createUser(app, { email: 'partner@example.com', role: Roles.member });

		const adminResponse = await request(app.server).patch('/users/role').set('Cookie', adminCookies).send({
			user_id: userToUpdate.id,
			role: Roles.partner,
		});
		expect(adminResponse.status).toBe(HTTP_STATUS.no_content);

		const { cookies: ownerCookies } = await createAndAuthenticateUser(app, {
			email: 'owner@example.com',
			role: Roles.owner,
		});
		const ownerResponse = await request(app.server).patch('/users/role').set('Cookie', ownerCookies).send({
			user_id: adminUser.id,
			role: Roles.partner,
		});
		expect(ownerResponse.status).toBe(HTTP_STATUS.no_content);

		const revokedResponse = await request(app.server).get('/me').set('Cookie', adminCookies).send();
		expect(revokedResponse.status).toBe(HTTP_STATUS.unauthorized);
		expect((revokedResponse.body as ErrorResponseBody).localeKey).toBe('apiResponses.auth.sessionRevoked');
		const clearedCookies = revokedResponse.headers['set-cookie'] as unknown as string[];
		expect(clearedCookies).toEqual(
			expect.arrayContaining([
				expect.stringContaining(`${AUTH_COOKIE}=;`),
				expect.stringContaining(`${AUTH_SESSION_COOKIE}=;`),
			]),
		);

		const events = await AdministrativeEventModel.find({
			action: AdministrativeEventActions.userRoleChanged,
		})
			.sort({ occurred_at: 1 })
			.lean();
		expect(events).toHaveLength(2);
		expect(events[0]).toMatchObject({
			target_user_id: userToUpdate.id,
			before: { role: Roles.member },
			after: { role: Roles.partner },
			origin: 'api',
		});
		expect(events[1]).toMatchObject({
			target_user_id: adminUser.id,
			before: { role: Roles.admin },
			after: { role: Roles.partner },
			origin: 'api',
		});
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
