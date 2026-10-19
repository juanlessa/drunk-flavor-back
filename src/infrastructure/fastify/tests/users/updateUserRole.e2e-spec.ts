import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { RolesEnum } from '@/shared/accessControl/roles';

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
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });

		const userToUpdate = await createUser(app, { email: 'partner@example.com', role: RolesEnum.member });

		const response = await request(app.server).patch('/users/role').set('Cookie', cookies).send({
			user_id: userToUpdate.id,
			role: RolesEnum.partner,
		});

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});

	it('Should not be able to update a user role when unauthenticated', async () => {
		const userToUpdate = await createUser(app, { email: 'member@example.com', role: RolesEnum.member });

		const response = await request(app.server).patch('/users/role').send({
			user_id: userToUpdate.id,
			role: RolesEnum.partner,
		});

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});

	it('Should not be able to update a user role as a partner', async () => {
		const { cookies } = await createAndAuthenticateUser(app, {
			email: 'partner@example.com',
			role: RolesEnum.partner,
		});

		const userToUpdate = await createUser(app, { email: 'member@example.com', role: RolesEnum.member });

		const response = await request(app.server).patch('/users/role').set('Cookie', cookies).send({
			user_id: userToUpdate.id,
			role: RolesEnum.partner,
		});

		expect(response.status).toBe(HTTP_STATUS.forbidden);
	});

	// DF-SEC-001 regression: a member must not be able to promote itself to admin.
	it('Should not allow a member to promote itself to admin (DF-SEC-001)', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, {
			email: 'member@example.com',
			role: RolesEnum.member,
		});

		const response = await request(app.server).patch('/users/role').set('Cookie', cookies).send({
			user_id: user.id,
			role: RolesEnum.admin,
		});

		expect(response.status).toBe(HTTP_STATUS.forbidden);
	});
});
