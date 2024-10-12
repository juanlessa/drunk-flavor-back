import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';

describe('Get User Profile', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to get the user profile', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.partner });

		const response = await request(app.server).get('/users/me').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});
});
