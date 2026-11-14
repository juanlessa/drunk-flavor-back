import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { withCreator } from '@/core/drinks/factories/authorship.factories';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { resolveDrinksRepository, resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { createCategory } from '@/infrastructure/fastify/tests/drinks/helpers/category.helpers';
import { createIngredient } from '@/infrastructure/fastify/tests/drinks/helpers/ingredient.helpers';
import { createUnit } from '@/infrastructure/fastify/tests/drinks/helpers/unit.helpers';

describe('List Ingredients', () => {
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

	it('Should be able to list the ingredients', async () => {
		await createIngredient();

		const response = await request(app.server).get('/ingredients').send();

		expect(response.status).toBe(HTTP_STATUS.ok);
	});

	it('Should be able to list only the ingredients that some drink uses', async () => {
		const { category } = await createCategory();
		const { unit } = await createUnit();
		const buildIngredient = (en: string, pt: string) =>
			resolveIngredientsRepository().create(
				withCreator({ translations: { en: { name: en }, pt: { name: pt } }, category, units: [unit] }),
			);
		const gin = await buildIngredient('Gin', 'Gin');
		const foam = await buildIngredient('Ginger foam', 'Espuma de gengibre');
		await buildIngredient('Unused', 'Sem uso');
		await resolveDrinksRepository().create(
			withCreator({
				translations: {
					en: { name: 'Ginger gin', method: 'Stir' },
					pt: { name: 'Gin gengibre', method: 'Mexa' },
				},
				ingredients: [
					createDrinkIngredientFactory(gin),
					createDrinkIngredientFactory(foam, { optional: true }),
				],
			}),
		);

		const response = await request(app.server).get('/ingredients').query({ inUse: 'true' }).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
		const listed = (response.body as { id: string }[]).map(({ id }) => id).sort();
		expect(listed).toEqual([gin.id, foam.id].sort());
	});
});
