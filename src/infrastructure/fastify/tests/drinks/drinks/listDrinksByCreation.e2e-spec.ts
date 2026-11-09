import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { withCreator } from '@/core/drinks/factories/authorship.factories';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { createIngredient } from '@/infrastructure/fastify/tests/drinks/helpers/ingredient.helpers';

describe('List Drinks by creation', () => {
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

	it('Should be able to list the newest drinks first', async () => {
		const { ingredient } = await createIngredient();
		const createAddedOn = async (name: string, createdAt: string) => {
			const drink = await resolveDrinksRepository().create(
				withCreator({
					translations: { en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } },
					ingredients: [createDrinkIngredientFactory(ingredient)],
				}),
			);
			// Dated, so the order does not depend on how fast the drinks are created.
			await DrinkModel.collection.updateOne(
				{ _id: new ObjectId(drink.id) },
				{ $set: { created_at: new Date(createdAt) } },
			);
		};
		// By name the order would be Caipirinha, Mojito, Negroni.
		await createAddedOn('Mojito', '2026-01-01T12:00:00.000Z');
		await createAddedOn('Negroni', '2026-03-01T12:00:00.000Z');
		await createAddedOn('Caipirinha', '2026-02-01T12:00:00.000Z');

		const response = await request(app.server)
			.get('/drinks')
			.query({ sort: JSON.stringify({ createdAt: 'desc' }), limit: 10, page: 1 });

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(
			(response.body as { translations: { en: { name: string } } }[]).map(
				({ translations }) => translations.en.name,
			),
		).toEqual(['Negroni', 'Caipirinha', 'Mojito']);
	});
});
