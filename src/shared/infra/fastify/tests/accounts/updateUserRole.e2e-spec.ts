import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/modules/accounts/entities/user.entity';
import { app } from '@/shared/infra/fastify/app';
import { MongoRepository } from '@/shared/infra/mongo/Mongo.repository';
import { createUserFactory } from '@/modules/accounts/container';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';
import { createAndAuthenticateUser, createUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/modules/accounts/infra/mongo/entities/user.model';

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
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.admin });

		const userToUpdate = await createUser(app, { email: 'partner@example.com', role: UserRolesEnum.partner });

		const response = await request(app.server).patch('/users/role').set('Cookie', cookies).send({
			user_id: userToUpdate.id,
			role: UserRolesEnum.partner,
		});

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
