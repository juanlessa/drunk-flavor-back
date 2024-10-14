import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

describe('Create Category', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(CategoryModel);
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to create a category', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.admin });

		const { translations } = createCategoryFactory();

		const response = await request(app.server).post('/categories').set('Cookie', cookies).send({ translations });

		expect(response.status).toBe(HTTP_STATUS.created);
	});
});
