import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';

describe('Update Profile', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to update the profile', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: UserRolesEnum.partner });

		const response = await request(app.server).patch('/me').set('Cookie', cookies).send({
			name: user.name,
			surname: 'updated',
		});

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
