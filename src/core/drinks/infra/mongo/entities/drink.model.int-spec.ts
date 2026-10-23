import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import {
	DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
	DrinkModel,
} from './drink.model';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Category } from '@/core/drinks/entities/category.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> => (await DrinkModel.collection.indexes()) as unknown as IndexInfo[];

const buildCategory = (): Category => ({
	_id: new ObjectId(),
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
	is_alcoholic: false,
	created_at: new Date(),
	updated_at: new Date(),
});

const buildUnit = (): Unit => ({
	_id: new ObjectId(),
	translations: {
		en: { name: 'milliliter', name_plural: 'milliliters' },
		pt: { name: 'mililitro', name_plural: 'mililitros' },
	},
	allow_decimal: true,
	kind: 'volume',
	created_at: new Date(),
	updated_at: new Date(),
});

const buildIngredient = (): Ingredient => ({
	_id: new ObjectId(),
	translations: { en: { name: 'Lime' }, pt: { name: 'Limão' } },
	category: buildCategory(),
	unit: buildUnit(),
	created_at: new Date(),
	updated_at: new Date(),
});

const buildDrink = (name: { en: string; pt: string }, overrides?: Record<string, unknown>) => ({
	translations: {
		en: { name: name.en, method: 'Stir' },
		pt: { name: name.pt, method: 'Mexa' },
	},
	ingredients: [{ ingredient: buildIngredient(), quantity: 60 }],
	...overrides,
});

describe('DrinkModel (integration)', () => {
	beforeAll(async () => {
		await DrinkModel.init();
	});

	afterEach(async () => {
		await DrinkModel.deleteMany({});
	});

	it('resolves to the drinks collection', () => {
		expect(DrinkModel.collection.collectionName).toBe('drinks');
	});

	it('declares only the owning unique indexes with no leaked embedded-name index', async () => {
		const indexes = await getIndexes();
		const names = indexes.map((index) => index.name).sort();

		expect(names).toEqual(
			['_id_', DRINK_TRANSLATIONS_EN_NAME_UNIQUE_INDEX, DRINK_TRANSLATIONS_PT_NAME_UNIQUE_INDEX].sort(),
		);
		expect(names).not.toContain('translations.en.name_1');
		expect(names).not.toContain('translations.pt.name_1');

		const leaked = indexes.filter((index) => Object.keys(index.key).some((key) => key.startsWith('ingredients.')));
		expect(leaked).toEqual([]);
	});

	it('reads back nested ingredients with embedded category and unit intact', async () => {
		const created = await DrinkModel.create(buildDrink({ en: 'Caipirinha', pt: 'Caipirinha BR' }));
		const reloaded = await DrinkModel.findById(created._id).lean();

		expect(reloaded?.ingredients).toHaveLength(1);
		expect(reloaded?.ingredients[0].quantity).toBe(60);
		expect(reloaded?.ingredients[0].ingredient.translations.en.name).toBe('Lime');
		expect(reloaded?.ingredients[0].ingredient.category.translations.en.name).toBe('Syrup');
		expect(reloaded?.ingredients[0].ingredient.unit.translations.en.name).toBe('milliliter');
	});

	it('defaults avg_rating to 0 and rejects out-of-range values', async () => {
		const created = await DrinkModel.create(buildDrink({ en: 'Mojito', pt: 'Mojito BR' }));
		expect(created.avg_rating).toBe(0);

		await expect(buildDrinkWith({ avg_rating: 6 })).rejects.toThrow();
		await expect(buildDrinkWith({ avg_rating: -1 })).rejects.toThrow();
	});

	it('defaults ratings_count to 0 and rejects non-integer or negative values', async () => {
		const created = await DrinkModel.create(buildDrink({ en: 'Negroni', pt: 'Negroni BR' }));
		expect(created.ratings_count).toBe(0);

		await expect(buildDrinkWith({ ratings_count: 1.5 })).rejects.toThrow();
		await expect(buildDrinkWith({ ratings_count: -1 })).rejects.toThrow();
	});

	it('leaves cover and thumbnail unset when omitted', async () => {
		const created = await DrinkModel.create(buildDrink({ en: 'Daiquiri', pt: 'Daiquiri BR' }));
		const reloaded = await DrinkModel.findById(created._id).lean();

		expect(reloaded?.cover).toBeUndefined();
		expect(reloaded?.thumbnail).toBeUndefined();
	});

	it('rejects duplicate translations.en.name and translations.pt.name with 11000', async () => {
		await DrinkModel.create(buildDrink({ en: 'Margarita', pt: 'Margarita BR' }));

		await expect(DrinkModel.create(buildDrink({ en: 'Margarita', pt: 'Outro' }))).rejects.toMatchObject({
			code: 11000,
		});
		await expect(DrinkModel.create(buildDrink({ en: 'Other', pt: 'Margarita BR' }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await DrinkModel.create(buildDrink({ en: 'Gimlet', pt: 'Gimlet BR' }));
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.set('translations.en.name', 'Gimlet Reserve');
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});

let uniqueCounter = 0;
const buildDrinkWith = (overrides: Record<string, unknown>) => {
	uniqueCounter += 1;
	return DrinkModel.create(buildDrink({ en: `Boundary ${uniqueCounter}`, pt: `Limite ${uniqueCounter}` }, overrides));
};
