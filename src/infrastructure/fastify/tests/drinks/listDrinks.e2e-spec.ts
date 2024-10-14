import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { createDrink } from '../helpers/drink.helpers';

describe('List Drink', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(CategoryModel);
		await MongoRepository.Instance.emptyCollection(IngredientModel);
		await MongoRepository.Instance.emptyCollection(DrinkModel);
	});

	it('Should be able to list the drinks', async () => {
		await createDrink();

		const response = await request(app.server).get('/drinks').send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});
});
