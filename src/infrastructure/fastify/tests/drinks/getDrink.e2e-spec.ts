import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { createDrink } from '../helpers/drink.helpers';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';

describe('Get Drink', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(DrinkModel);
	});

	it('Should be able to get a drink', async () => {
		const { id } = await createDrink();

		const response = await request(app.server).get(`/drinks/${id}`).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});
});
