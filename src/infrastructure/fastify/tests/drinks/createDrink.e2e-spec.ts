import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { createIngredient } from '../helpers/ingredient.helpers';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { Roles } from '@/shared/accessControl/roles';

describe('Create Drink', () => {
	beforeAll(async () => {
		await app.ready();
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
	});

	it('Should be able to create a drink', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id: ingredient_id } = await createIngredient();

		const { translations } = createDrinkFactory();
		const ingredients = [{ ingredient_id, quantity: 60 }];

		const response = await request(app.server)
			.post('/drinks')
			.set('Cookie', cookies)
			.send({ translations, ingredients });

		const body = response.body as { id?: unknown };

		expect(response.status).toBe(HTTP_STATUS.created);
		expect(body).toHaveProperty('id');
		expect(typeof body.id).toBe('string');
	});
});
