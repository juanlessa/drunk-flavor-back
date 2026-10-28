import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import {
	INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
	IngredientModel,
	IngredientPersistence,
} from './ingredient.model';
import { CategoryPersistence } from './category.model';
import { UnitPersistence } from './unit.model';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> =>
	(await IngredientModel.collection.indexes()) as unknown as IndexInfo[];

const buildCategory = (): CategoryPersistence => ({
	_id: new ObjectId(),
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
	is_alcoholic: false,
	created_at: new Date(),
	updated_at: new Date(),
});

const buildUnit = (): UnitPersistence => ({
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

const buildIngredient = (name: {
	en: string;
	pt: string;
}): Omit<IngredientPersistence, '_id' | 'created_at' | 'updated_at'> => ({
	translations: { en: { name: name.en }, pt: { name: name.pt } },
	category: buildCategory(),
	unit: buildUnit(),
});

describe('IngredientModel (integration)', () => {
	beforeAll(async () => {
		await IngredientModel.init();
	});

	afterEach(async () => {
		await IngredientModel.deleteMany({});
	});

	it('resolves to the ingredients collection', () => {
		expect(IngredientModel.collection.collectionName).toBe('ingredients');
	});

	it('declares only the owning unique indexes with no leaked embedded-name index', async () => {
		const indexes = await getIndexes();
		const names = indexes.map((index) => index.name).sort();

		expect(names).toEqual(
			['_id_', INGREDIENT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX, INGREDIENT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX].sort(),
		);
		expect(names).not.toContain('translations.en.name_1');
		expect(names).not.toContain('translations.pt.name_1');

		// No index should be keyed on an embedded category/unit name path.
		const leaked = indexes.filter((index) =>
			Object.keys(index.key).some((key) => key.startsWith('category.') || key.startsWith('unit.')),
		);
		expect(leaked).toEqual([]);
	});

	it('reads back the embedded category and unit subdocuments intact', async () => {
		const created = await IngredientModel.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));
		const reloaded = await IngredientModel.findById(created._id).lean();

		expect(reloaded?.category?.translations.en.name).toBe('Syrup');
		expect(reloaded?.unit?.translations.en.name).toBe('milliliter');
		expect(reloaded?.unit?.kind).toBe('volume');
	});

	it('rejects duplicate translations.en.name and translations.pt.name with 11000', async () => {
		await IngredientModel.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));

		await expect(IngredientModel.create(buildIngredient({ en: 'Lime', pt: 'Outro' }))).rejects.toMatchObject({
			code: 11000,
		});
		await expect(IngredientModel.create(buildIngredient({ en: 'Other', pt: 'Limão' }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await IngredientModel.create(buildIngredient({ en: 'Lime', pt: 'Limão' }));
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.set('translations.en.name', 'Lemon');
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});
