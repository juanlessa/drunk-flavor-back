import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { createIngredient } from '../helpers/ingredient.helpers';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';

describe('Create Drink', () => {
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
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to create a drink', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.admin });
		const { id: ingredient_id } = await createIngredient();

		const { translations } = createDrinkFactory();
		const ingredients = [{ ingredient_id, quantity: 60 }];

		const response = await request(app.server)
			.post('/drinks')
			.set('Cookie', cookies)
			.send({ translations, ingredients });

		expect(response.status).toBe(HTTP_STATUS.created);
	});
});
