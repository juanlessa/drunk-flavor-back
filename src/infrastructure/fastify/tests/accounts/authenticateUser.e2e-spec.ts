import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { createUser } from '../helpers/authentication.helpers';

describe('Authenticate User', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('should be able to authenticate a user', async () => {
		const user = await createUser(app, { role: UserRolesEnum.partner });

		const response = await request(app.server)
			.post('/sessions')
			.send({ email: user.email, password: user.password });

		expect(response.status).toBe(200);
	});
});
