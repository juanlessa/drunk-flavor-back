import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { UserTokenModel } from '@/core/accounts/infra/mongo/entities/userToken.model';
import { Roles } from '@/shared/accessControl/roles';

describe('Create User', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(UserTokenModel);
	});

	it('Should be able to admin create a user', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });

		const { name, surname, email, password, role } = createUserFactory({
			email: 'partner@example.com',
			role: Roles.partner,
		});

		const response = await request(app.server)
			.post('/users')
			.set('Cookie', cookies)
			.send({ name, surname, email, password, role });

		expect(response.status).toBe(HTTP_STATUS.created);
	});

	it('Should not be able to create a user when unauthenticated', async () => {
		const { name, surname, email, password, role } = createUserFactory({
			email: 'partner@example.com',
			role: Roles.partner,
		});

		const response = await request(app.server).post('/users').send({ name, surname, email, password, role });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
	});

	it('Should not be able to create a user as a member', async () => {
		const { cookies } = await createAndAuthenticateUser(app, {
			email: 'member@example.com',
			role: Roles.member,
		});

		const { name, surname, email, password, role } = createUserFactory({
			email: 'partner@example.com',
			role: Roles.partner,
		});

		const response = await request(app.server)
			.post('/users')
			.set('Cookie', cookies)
			.send({ name, surname, email, password, role });

		expect(response.status).toBe(HTTP_STATUS.forbidden);
	});

	it('Should not be able to create a user as a partner', async () => {
		const { cookies } = await createAndAuthenticateUser(app, {
			email: 'partner@example.com',
			role: Roles.partner,
		});

		const { name, surname, email, password, role } = createUserFactory({
			email: 'new-partner@example.com',
			role: Roles.partner,
		});

		const response = await request(app.server)
			.post('/users')
			.set('Cookie', cookies)
			.send({ name, surname, email, password, role });

		expect(response.status).toBe(HTTP_STATUS.forbidden);
	});
});
