import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { createDrink } from '../helpers/drink.helpers';
import { createRatingRecord } from '../helpers/rating.helpers';

describe('List Ratings By Drink', () => {
	beforeAll(async () => {
		await app.ready();
		await RatingModel.init();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(DrinkModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(RatingModel);
	});

	it('Should be able to list the ratings by drink', async () => {
		const { id: drinkId } = await createDrink();
		await createRatingRecord({ drinkId, value: 4 });
		const byDrink = await request(app.server).get(`/drinks/${drinkId}/ratings`).send();
		expect(byDrink.status).toBe(HTTP_STATUS.ok);
		expect((byDrink.body as unknown[]).length).toBe(1);
	});
});
