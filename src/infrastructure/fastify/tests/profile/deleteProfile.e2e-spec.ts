import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserTokenModel } from '@/core/accounts/infra/mongo/entities/userToken.model';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('Delete Profile', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
		await MongoRepository.Instance.emptyCollection(UserTokenModel);
	});

	it('Should be able to delete the profile', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });

		const response = await request(app.server).delete('/me').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
