import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { app } from '@/infra/fastify/app';
import { MongoRepository } from '@/infra/mongo/Mongo.repository';
import { createUserFactory } from '@/modules/accounts/container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/modules/accounts/infra/mongo/entities/user.model';

describe('Create User', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to create a user', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.admin });

		const createUserData = createUserFactory({ email: 'partner@example.com', role: UserRolesEnum.partner });

		const response = await request(app.server).post('/users').set('Cookie', cookies).send(createUserData);

		expect(response.status).toBe(HTTP_STATUS.created);
	});
});
