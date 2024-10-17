import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('List Users', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to list the users', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });

		await createUser(app, { email: 'partner1@example.com', role: RolesEnum.partner });
		await createUser(app, { email: 'member1@example.com', role: RolesEnum.member });

		const response = await request(app.server).get('/users').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});
});
