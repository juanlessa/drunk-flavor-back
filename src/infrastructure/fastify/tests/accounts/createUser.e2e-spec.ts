import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { UserTokenModel } from '@/core/accounts/infra/mongo/entities/userToken.model';

describe('Create User', () => {
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

	it('Should be able to create a user', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.admin });

		const { name, surname, email, password, role } = createUserFactory({
			email: 'partner@example.com',
			role: UserRolesEnum.partner,
		});

		const response = await request(app.server)
			.post('/users')
			.set('Cookie', cookies)
			.send({ name, surname, email, password, role });

		expect(response.status).toBe(HTTP_STATUS.created);
	});
});
