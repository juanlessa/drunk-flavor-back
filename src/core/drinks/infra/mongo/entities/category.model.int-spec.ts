import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
	CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
	CategoryModel,
} from './category.model';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> =>
	(await CategoryModel.collection.indexes()) as unknown as IndexInfo[];

const buildCategory = (name: { en: string; pt: string }) => ({
	translations: { en: { name: name.en }, pt: { name: name.pt } },
	is_alcoholic: false,
});

describe('CategoryModel (integration)', () => {
	beforeAll(async () => {
		await CategoryModel.init();
	});

	afterEach(async () => {
		await CategoryModel.deleteMany({});
	});

	it('resolves to the categories collection', () => {
		expect(CategoryModel.collection.collectionName).toBe('categories');
	});

	it('declares exactly the expected named unique indexes and no implicit field-level index', async () => {
		const indexes = await getIndexes();
		const names = indexes.map((index) => index.name).sort();

		expect(names).toEqual(
			['_id_', CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX, CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX].sort(),
		);

		// The old auto-named field-level indexes must no longer exist.
		expect(names).not.toContain('translations.en.name_1');
		expect(names).not.toContain('translations.pt.name_1');

		const enIndex = indexes.find((index) => index.name === CATEGORY_TRANSLATIONS_EN_NAME_UNIQUE_INDEX);
		const ptIndex = indexes.find((index) => index.name === CATEGORY_TRANSLATIONS_PT_NAME_UNIQUE_INDEX);
		expect(enIndex?.key).toEqual({ 'translations.en.name': 1 });
		expect(enIndex?.unique).toBe(true);
		expect(ptIndex?.key).toEqual({ 'translations.pt.name': 1 });
		expect(ptIndex?.unique).toBe(true);
	});

	it('rejects a duplicate translations.en.name with an 11000 error', async () => {
		await CategoryModel.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

		await expect(CategoryModel.create(buildCategory({ en: 'Citrus', pt: 'Outro' }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('rejects a duplicate translations.pt.name with an 11000 error', async () => {
		await CategoryModel.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));

		await expect(CategoryModel.create(buildCategory({ en: 'Other', pt: 'Cítrico' }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('allows distinct names in both languages', async () => {
		await CategoryModel.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
		await expect(CategoryModel.create(buildCategory({ en: 'Herbal', pt: 'Herbal' }))).resolves.toBeDefined();
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await CategoryModel.create(buildCategory({ en: 'Citrus', pt: 'Cítrico' }));
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.is_alcoholic = true;
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});
