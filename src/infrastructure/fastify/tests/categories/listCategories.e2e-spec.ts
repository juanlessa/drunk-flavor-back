import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { createCategory } from '../helpers/category.helpers';

describe('List Categories', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
	});

	it('Should be able to list the categories', async () => {
		await createCategory();

		const response = await request(app.server).get('/categories').send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});
});
