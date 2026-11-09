import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { CORS_OPTIONS } from '@/infrastructure/fastify/constants/cors.constants';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { resolveDrinksRepository, resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { createCategory } from '@/infrastructure/fastify/tests/drinks/helpers/category.helpers';
import { createUnit } from '@/infrastructure/fastify/tests/drinks/helpers/unit.helpers';
import { queryRequest } from '@/infrastructure/fastify/tests/drinks/helpers/queryMethod.helpers';

describe('Match Drinks', () => {
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

	it('Should be able to find the drinks that can be made with the ingredients a person has', async () => {
		// One category and one unit for every ingredient: the helpers would create a new one each time, under the
		// same name, which the unique index rejects.
		const { category } = await createCategory();
		const { unit } = await createUnit();
		const buildIngredient = (en: string, pt: string) =>
			resolveIngredientsRepository().create({
				translations: { en: { name: en }, pt: { name: pt, gender: 'masculine' } },
				category,
				units: [unit],
			});
		const gin = await buildIngredient('Gin', 'Gin');
		const lime = await buildIngredient('Lime', 'Limão');
		const sugar = await buildIngredient('Sugar', 'Açúcar');
		const names = (name: string) => ({ en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } });
		await resolveDrinksRepository().create({
			translations: names('Gimlet'),
			ingredients: [createDrinkIngredientFactory(gin), createDrinkIngredientFactory(lime)],
		});
		await resolveDrinksRepository().create({
			translations: names('Gin sour'),
			ingredients: [
				createDrinkIngredientFactory(gin),
				createDrinkIngredientFactory(lime),
				createDrinkIngredientFactory(sugar),
			],
		});

		const response = await queryRequest(app.server, '/drinks/match?limit=10&page=1').send({
			ingredientIds: [gin.id, lime.id],
			maxMissing: 1,
		});

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toMatchObject({
			items: [
				{ drink: { translations: { en: { name: 'Gimlet' } } }, missingCount: 0, missingIngredientIds: [] },
				{
					drink: { translations: { en: { name: 'Gin sour' } } },
					missingCount: 1,
					missingIngredientIds: [sugar.id],
				},
			],
		});
	});

	it('Should answer the preflight of a browser asking to use the QUERY method', async () => {
		const origin = [CORS_OPTIONS.origin].flat()[0] as string;

		const response = await request(app.server)
			.options('/drinks/match')
			.set('Origin', origin)
			.set('Access-Control-Request-Method', 'QUERY')
			.set('Access-Control-Request-Headers', 'content-type');

		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(response.headers['access-control-allow-methods']).toContain('QUERY');
	});
});
