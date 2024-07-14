import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infra/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infra/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';

describe('Delete User', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to delete a user', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.admin });

		const userToDelete = await createUser(app, { email: 'partner@example.com', role: UserRolesEnum.partner });

		const response = await request(app.server)
			.delete('/users')
			.set('Cookie', cookies)
			.send({ id: userToDelete.id });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
