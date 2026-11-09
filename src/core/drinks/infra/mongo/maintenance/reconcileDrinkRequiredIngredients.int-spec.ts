import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { DrinkModel } from '../entities/drink.model';
import { DrinksRepository } from '../repositories/Drinks.repository';
import { RECONCILE_BATCH_SIZE, reconcileDrinkRequiredIngredients } from './reconcileDrinkRequiredIngredients';

type RawRecipeLine = { optional: boolean; ingredient: { _id: ObjectId } };

const gin = new ObjectId();
const lime = new ObjectId();
const sugar = new ObjectId();

/** Inserts a drink the way it was stored before the field existed: straight into the collection, with no field. */
const insertLegacyDrink = async (name: string, lines: RawRecipeLine[], extra: Record<string, unknown> = {}) => {
	const { insertedId } = await DrinkModel.collection.insertOne({
		translations: { en: { name, method: 'Stir' }, pt: { name, method: 'Mexa' } },
		ingredients: lines,
		garnishes: [],
		avg_rating: 0,
		ratings_count: 0,
		ratings_sum: 0,
		...extra,
	});
	return insertedId;
};
const line = (ingredientId: ObjectId, optional = false): RawRecipeLine => ({
	optional,
	ingredient: { _id: ingredientId },
});
const storedRequiredIds = async (id: ObjectId) => {
	const raw = await DrinkModel.collection.findOne({ _id: id });
	return (raw?.['required_ingredient_ids'] as ObjectId[] | undefined)?.map((value) => value.toHexString());
};

describe('reconcileDrinkRequiredIngredients (integration)', () => {
	beforeAll(async () => {
		await DrinkModel.init();
	});
	afterEach(async () => {
		await DrinkModel.deleteMany({});
	});

	it('writes the required ingredient ids on drinks that were stored without them', async () => {
		const id = await insertLegacyDrink('Gimlet', [line(gin), line(lime)]);
		expect(await storedRequiredIds(id)).toBeUndefined();

		const updated = await reconcileDrinkRequiredIngredients();

		expect(updated).toBe(1);
		expect(await storedRequiredIds(id)).toEqual([gin.toHexString(), lime.toHexString()]);
	});

	it('makes the drinks stored before the field existed show up in the search by ingredients', async () => {
		await insertLegacyDrink('Gimlet', [line(gin), line(lime)]);
		const repository = new DrinksRepository();
		const search = () => repository.findByIngredients({ ingredientIds: [gin.toHexString()], maxMissing: 'any' });
		expect(await search()).toEqual([]);

		await reconcileDrinkRequiredIngredients();

		expect((await search()).map(({ drink }) => drink.translations.en.name)).toEqual(['Gimlet']);
	});

	it('leaves out the optional ingredients and counts a repeated ingredient once', async () => {
		const id = await insertLegacyDrink('Gimlet', [line(gin), line(gin), line(lime, true), line(sugar)]);

		await reconcileDrinkRequiredIngredients();

		expect(await storedRequiredIds(id)).toEqual([gin.toHexString(), sugar.toHexString()]);
	});

	it('stores an empty list for a drink whose ingredients are all optional', async () => {
		const id = await insertLegacyDrink('Only optional', [line(gin, true)]);

		await reconcileDrinkRequiredIngredients();

		expect(await storedRequiredIds(id)).toEqual([]);
	});

	it('corrects the ids of a drink whose stored ids no longer match its recipe', async () => {
		const id = await insertLegacyDrink('Gimlet', [line(gin)], { required_ingredient_ids: [sugar] });

		await reconcileDrinkRequiredIngredients();

		expect(await storedRequiredIds(id)).toEqual([gin.toHexString()]);
	});

	it('changes nothing else on the drinks, not even their update date', async () => {
		const updatedAt = new Date('2026-01-15T10:00:00.000Z');
		const id = await insertLegacyDrink('Gimlet', [line(gin)], {
			avg_rating: 4,
			ratings_count: 2,
			ratings_sum: 8,
			updated_at: updatedAt,
		});
		const before = await DrinkModel.collection.findOne({ _id: id });

		await reconcileDrinkRequiredIngredients();

		const { required_ingredient_ids: _written, ...rest } = (await DrinkModel.collection.findOne({
			_id: id,
		})) as Record<string, unknown>;
		expect(rest).toEqual(before);
		expect(rest['updated_at']).toEqual(updatedAt);
	});

	it('gives the same result when it runs again', async () => {
		const id = await insertLegacyDrink('Gimlet', [line(gin), line(lime)]);

		await reconcileDrinkRequiredIngredients();
		const firstRun = await storedRequiredIds(id);
		const updatedAgain = await reconcileDrinkRequiredIngredients();

		expect(updatedAgain).toBe(1);
		expect(await storedRequiredIds(id)).toEqual(firstRun);
	});

	it('writes every drink when there are more than one batch of them', async () => {
		const total = RECONCILE_BATCH_SIZE + 1;
		await DrinkModel.collection.insertMany(
			Array.from({ length: total }, (_, index) => ({
				translations: {
					en: { name: `Drink ${index}`, method: 'm' },
					pt: { name: `Drink ${index}`, method: 'm' },
				},
				ingredients: [line(gin)],
				garnishes: [],
			})),
		);

		const updated = await reconcileDrinkRequiredIngredients();

		expect(updated).toBe(total);
		expect(await DrinkModel.collection.countDocuments({ required_ingredient_ids: { $size: 1 } })).toBe(total);
	});

	it('does nothing when there are no drinks', async () => {
		await expect(reconcileDrinkRequiredIngredients()).resolves.toBe(0);
	});
});
