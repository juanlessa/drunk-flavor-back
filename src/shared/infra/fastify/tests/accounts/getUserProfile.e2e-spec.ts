import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/shared/infra/fastify/app';
import { UserModel } from '@/modules/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/shared/infra/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserRolesEnum } from '@/modules/accounts/entities/user.entity';

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