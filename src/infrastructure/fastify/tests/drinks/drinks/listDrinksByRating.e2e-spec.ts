import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { withCreator } from '@/core/drinks/factories/authorship.factories';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveDrinksModule } from '@/core/drinks/public';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { createIngredient } from '@/infrastructure/fastify/tests/drinks/helpers/ingredient.helpers';

describe('List Drinks by rating', () => {
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

	it('Should be able to list the best rated drinks first, by name among the drinks with the same rating', async () => {
		const { ingredient } = await createIngredient();
		const createRated = async (name: string, rating: number) => {
			const drink = await resolveDrinksRepository().create(
				withCreator({
					translations: { en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } },
					ingredients: [createDrinkIngredientFactory(ingredient)],
				}),
			);
			await resolveDrinksModule().applyRatingDelta({ drinkId: drink.id, countDelta: 1, sumDelta: rating });
		};
		// By name alone they would read Caipirinha, Mojito, Negroni: the rating has to come first to change that.
		await createRated('Negroni', 5);
		await createRated('Mojito', 4);
		await createRated('Caipirinha', 5);

		const response = await request(app.server)
			.get('/drinks')
			.query({ sort: JSON.stringify({ avgRating: 'desc', 'translations.pt.name': 'asc' }), limit: 10, page: 1 });

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(
			(response.body as { translations: { pt: { name: string } } }[]).map(
				({ translations }) => translations.pt.name,
			),
		).toEqual(['Caipirinha', 'Negroni', 'Mojito']);
	});

	it('Should be able to list the drinks by rating score, ranking many good ratings above a single perfect one', async () => {
		const { ingredient } = await createIngredient();
		const createRated = async (name: string, value?: number, times = 1) => {
			const drink = await resolveDrinksRepository().create(
				withCreator({
					translations: { en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } },
					ingredients: [createDrinkIngredientFactory(ingredient)],
				}),
			);
			for (let index = 0; value !== undefined && index < times; index += 1) {
				await resolveDrinksModule().applyRatingDelta({ drinkId: drink.id, countDelta: 1, sumDelta: value });
			}
		};
		// By the plain average or by name the order would be Caipirinha, Mojito, Negroni.
		await createRated('Caipirinha', 5);
		await createRated('Mojito', 4, 10);
		await createRated('Negroni');

		const response = await request(app.server)
			.get('/drinks')
			.query({
				sort: JSON.stringify({ ratingScore: 'desc', 'translations.pt.name': 'asc' }),
				limit: 10,
				page: 1,
			});

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(
			(response.body as { translations: { pt: { name: string } } }[]).map(
				({ translations }) => translations.pt.name,
			),
		).toEqual(['Mojito', 'Caipirinha', 'Negroni']);
	});
});
