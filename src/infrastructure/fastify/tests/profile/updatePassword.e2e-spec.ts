import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('Update Password', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to update the password', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: RolesEnum.partner });

		const newPassword = 'New-password-87654321';

		const response = await request(app.server).patch('/update-password').set('Cookie', cookies).send({
			currentPassword: user.password,
			newPassword: newPassword,
			confirmNewPassword: newPassword,
		});

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
