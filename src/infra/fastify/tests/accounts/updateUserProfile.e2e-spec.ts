import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { app } from '@/infra/fastify/app';
import { MongoRepository } from '@/infra/mongo/Mongo.repository';
import { createUserFactory } from '@/modules/accounts/container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/modules/accounts/infra/mongo/entities/user.model';

describe('Update User Profile', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to update the user profile', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: UserRolesEnum.partner });

		const response = await request(app.server).patch('/users/me').set('Cookie', cookies).send({
			id: user.id,
			name: user.name,
			surname: 'updated',
			email: 'updated@example.com',
			password: user.password,
		});

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
