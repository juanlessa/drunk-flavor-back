import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { createIngredient } from '@/infrastructure/fastify/tests/drinks/helpers/ingredient.helpers';
import { Roles } from '@/shared/accessControl/roles';

describe('Generate Method', () => {
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

	it('Should be able to write the method of a drink from its preparation plan', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id: ingredientId, unitId } = await createIngredient();
		const ingredients = [{ ingredientId, amount: { type: 'exact', quantity: 60, unitId }, optional: false }];
		const preparation = {
			mixingVessel: 'serving_glass',
			servingGlass: 'rocks',
			actions: [{ type: 'add', target: 'mixing', items: [{ list: 'ingredients', ingredientId, unitId }] }],
		};

		const response = await request(app.server)
			.post('/drinks/method')
			.set('Cookie', cookies)
			.send({ ingredients, preparation });

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toMatchObject({
			method: { en: 'In a rocks glass, add syrup.', pt: 'Em um copo baixo, adicione o xarope.' },
			warnings: [],
		});
	});
});
