import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { UserTokenModel } from '@/core/accounts/infra/mongo/entities/userToken.model';

describe('Signup', () => {
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

	it('Should be able to signup', async () => {
		const { name, surname, email, password } = createUserFactory({
			email: 'partner@example.com',
		});

		const response = await request(app.server).post('/signup').send({ name, surname, email, password });

		expect(response.status).toBe(HTTP_STATUS.created);
	});
});
