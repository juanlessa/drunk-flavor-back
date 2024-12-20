import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('Update User Role', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to update the role of a user', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });

		const userToUpdate = await createUser(app, { email: 'partner@example.com', role: RolesEnum.member });

		const response = await request(app.server).patch('/users/role').set('Cookie', cookies).send({
			user_id: userToUpdate.id,
			role: RolesEnum.partner,
		});

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
