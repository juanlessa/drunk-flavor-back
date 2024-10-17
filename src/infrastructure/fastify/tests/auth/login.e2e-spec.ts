import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { createUser } from '../helpers/authentication.helpers';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('Login', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('should be able to login', async () => {
		const { email, password } = await createUser(app, { role: RolesEnum.partner });

		const response = await request(app.server).post('/login').send({ email, password });

		expect(response.status).toBe(200);
	});
});
