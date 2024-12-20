import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserTokenModel } from '@/core/accounts/infra/mongo/entities/userToken.model';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('Delete User', () => {
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

	it('Should be able to delete a user', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });

		const userToDelete = await createUser(app, { email: 'partner@example.com', role: RolesEnum.partner });

		const response = await request(app.server)
			.delete('/users')
			.set('Cookie', cookies)
			.send({ id: userToDelete.id });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
