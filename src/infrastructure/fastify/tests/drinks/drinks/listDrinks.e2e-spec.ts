import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { createDrink } from '@/infrastructure/fastify/tests/drinks/helpers/drink.helpers';
import { createCategory } from '@/infrastructure/fastify/tests/drinks/helpers/category.helpers';
import { createUnit } from '@/infrastructure/fastify/tests/drinks/helpers/unit.helpers';
import { withCreator } from '@/core/drinks/factories/authorship.factories';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { resolveDrinksRepository, resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';

describe('List Drink', () => {
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
	});

	it('Should be able to list the drinks', async () => {
		await createDrink();

		const response = await request(app.server).get('/drinks').send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});

	it('Should be able to search the drinks by name, the name matches first and then the ingredients', async () => {
		const { category } = await createCategory();
		const { unit } = await createUnit();
		const createIngredient = (name: string) =>
			resolveIngredientsRepository().create(
				withCreator({ translations: { en: { name }, pt: { name } }, category, units: [unit] }),
			);
		const createNamedDrink = async (name: string, ingredientName: string) => {
			const ingredient = await createIngredient(ingredientName);
			return resolveDrinksRepository().create(
				withCreator({
					translations: { en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } },
					ingredients: [createDrinkIngredientFactory(ingredient)],
				}),
			);
		};
		const byIngredient = await createNamedDrink('Negroni', 'Gin');
		const byName = await createNamedDrink('Gin Fizz', 'Soda');
		await createNamedDrink('Mojito', 'Rum');

		const response = await request(app.server)
			.get('/drinks')
			.query({ search: JSON.stringify({ name: 'gin' }) })
			.send();

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect((response.body as { id: string }[]).map(({ id }) => id)).toEqual([byName.id, byIngredient.id]);
	});
});
