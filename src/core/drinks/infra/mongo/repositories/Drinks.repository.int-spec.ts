import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { DrinksRepository } from './Drinks.repository';
import { DrinkModel } from '../entities/drink.model';
import { CreateDrink } from '@/core/drinks/dtos/drink.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

const buildCategory = (): Category => ({
	id: new ObjectId().toString(),
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
	isAlcoholic: false,
	createdAt: new Date(),
	updatedAt: new Date(),
});

const buildUnit = (): Unit => ({
	id: new ObjectId().toString(),
	translations: {
		en: { name: 'milliliter', namePlural: 'milliliters' },
		pt: { name: 'mililitro', namePlural: 'mililitros' },
	},
	allowDecimal: true,
	kind: 'volume',
	createdAt: new Date(),
	updatedAt: new Date(),
});

const buildIngredient = (): Ingredient => ({
	id: new ObjectId().toString(),
	translations: { en: { name: 'Lime' }, pt: { name: 'Limão' } },
	category: buildCategory(),
	unit: buildUnit(),
	createdAt: new Date(),
	updatedAt: new Date(),
});

const buildDrink = (name: { en: string; pt: string }): CreateDrink => ({
	translations: {
		en: { name: name.en, method: 'Stir' },
		pt: { name: name.pt, method: 'Mexa' },
	},
	ingredients: [{ ingredient: buildIngredient(), quantity: 60 }],
});

let repository: DrinksRepository;

describe('DrinksRepository (integration)', () => {
	beforeAll(async () => {
		await DrinkModel.init();
	});

	beforeEach(() => {
		repository = new DrinksRepository();
	});

	afterEach(async () => {
		await DrinkModel.deleteMany({});
	});

	it('returns lean documents without __v', async () => {
		const created = await repository.create(buildDrink({ en: 'Caipirinha', pt: 'Caipirinha BR' }));

		const byId = await repository.findById(created.id);
		const byName = await repository.findByName({ en: { name: 'Caipirinha' } });
		const [listed] = await repository.findAll({});

		expect(byId as Record<string, unknown>).not.toHaveProperty('__v');
		expect(byName as Record<string, unknown>).not.toHaveProperty('__v');
		expect(listed as Record<string, unknown>).not.toHaveProperty('__v');
	});

	it('round-trips a drink with nested ingredient embedding category and unit', async () => {
		const created = await repository.create(buildDrink({ en: 'Mojito', pt: 'Mojito BR' }));
		const byId = await repository.findById(created.id);

		expect(byId?.ingredients).toHaveLength(1);
		expect(byId?.ingredients[0].quantity).toBe(60);
		expect(byId?.ingredients[0].ingredient.translations.en.name).toBe('Lime');
		expect(byId?.ingredients[0].ingredient.category.translations.en.name).toBe('Syrup');
		expect(byId?.ingredients[0].ingredient.unit.translations.en.name).toBe('milliliter');
	});

	it('finds by name across languages and returns null on no match', async () => {
		await repository.create(buildDrink({ en: 'Negroni', pt: 'Negroni BR' }));

		expect(await repository.findByName({ en: { name: 'Negroni' } })).not.toBeNull();
		expect(await repository.findByName({ pt: { name: 'Negroni BR' } })).not.toBeNull();
		expect(await repository.findByName({ en: { name: 'Nonexistent' } })).toBeNull();
	});

	it('throws NotFoundError on update/delete of a missing id and returns the updated doc on success', async () => {
		await expect(
			repository.update({ id: new ObjectId().toString(), translations: { en: { name: 'X' } } }),
		).rejects.toBeInstanceOf(NotFoundError);
		await expect(repository.delete(new ObjectId().toString())).rejects.toBeInstanceOf(NotFoundError);

		const created = await repository.create(buildDrink({ en: 'Daiquiri', pt: 'Daiquiri BR' }));
		const updated = await repository.update({
			id: created.id,
			translations: { en: { name: 'Daiquiri Reserve' } },
		});
		expect(updated.translations.en.name).toBe('Daiquiri Reserve');
	});

	it('translates a sequential duplicate en/pt name create to BadRequestError', async () => {
		await repository.create(buildDrink({ en: 'Margarita', pt: 'Margarita BR' }));

		await expect(repository.create(buildDrink({ en: 'Margarita', pt: 'Outro' }))).rejects.toBeInstanceOf(
			BadRequestError,
		);
		await expect(repository.create(buildDrink({ en: 'Other', pt: 'Margarita BR' }))).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});

	it('resolves a concurrent create race to one persisted doc and one domain rejection', async () => {
		const results = await Promise.allSettled([
			repository.create(buildDrink({ en: 'Gimlet', pt: 'Gimlet BR' })),
			repository.create(buildDrink({ en: 'Gimlet', pt: 'Gimlet BR' })),
		]);

		expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
		const rejected = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
		expect(rejected).toHaveLength(1);
		expect(rejected[0].reason).toBeInstanceOf(BadRequestError);

		expect(await DrinkModel.countDocuments({ 'translations.en.name': 'Gimlet' })).toBe(1);
	});

	it('translates an update rename collision to BadRequestError', async () => {
		await repository.create(buildDrink({ en: 'Margarita', pt: 'Margarita BR' }));
		const other = await repository.create(buildDrink({ en: 'Paloma', pt: 'Paloma BR' }));

		await expect(
			repository.update({ id: other.id, translations: { en: { name: 'Margarita' } } }),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('orders findAll deterministically with the _id tie-breaker under equal sort keys', async () => {
		const sharedDate = new Date('2024-01-01T00:00:00.000Z');
		const ids = [new ObjectId(), new ObjectId(), new ObjectId()];
		await DrinkModel.collection.insertMany(
			ids.map((id, index) => ({
				_id: id,
				translations: {
					en: { name: `Drink ${index}`, method: 'm' },
					pt: { name: `Drink PT ${index}`, method: 'm' },
				},
				ingredients: [],
				avg_rating: 0,
				ratings_count: 0,
				createdAt: sharedDate,
				updatedAt: sharedDate,
			})),
		);

		const expectedOrder = [...ids].map((id) => id.toString()).sort((a, b) => (a > b ? -1 : 1));

		const firstPage = await repository.findAll({ page: 1, limit: 2, sort: { createdAt: -1 } });
		const secondPage = await repository.findAll({ page: 2, limit: 2, sort: { createdAt: -1 } });

		expect(firstPage.map((item) => item.id)).toEqual(expectedOrder.slice(0, 2));
		expect(secondPage.map((item) => item.id)).toEqual(expectedOrder.slice(2, 3));
	});

	it('succeeds with no sort supplied', async () => {
		await repository.create(buildDrink({ en: 'Caipirinha', pt: 'Caipirinha BR' }));
		await expect(repository.findAll({})).resolves.toHaveLength(1);
	});
});
