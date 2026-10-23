import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
	UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX,
	UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX,
	UnitModel,
} from './unit.model';
import { CreateUnit } from '@/core/drinks/dtos/unit.dtos';

type IndexInfo = { name: string; key: Record<string, number>; unique?: boolean };

const getIndexes = async (): Promise<IndexInfo[]> => (await UnitModel.collection.indexes()) as unknown as IndexInfo[];

const buildUnit = (name: { en: string; pt: string }): CreateUnit => ({
	translations: {
		en: { name: name.en, name_plural: `${name.en}s` },
		pt: { name: name.pt, name_plural: `${name.pt}s` },
	},
	allow_decimal: true,
	kind: 'volume',
});

describe('UnitModel (integration)', () => {
	beforeAll(async () => {
		await UnitModel.init();
	});

	afterEach(async () => {
		await UnitModel.deleteMany({});
	});

	it('resolves to the units collection', () => {
		expect(UnitModel.collection.collectionName).toBe('units');
	});

	it('declares exactly the expected named unique indexes and no implicit field-level index', async () => {
		const indexes = await getIndexes();
		const names = indexes.map((index) => index.name).sort();

		expect(names).toEqual(
			['_id_', UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX, UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX].sort(),
		);
		expect(names).not.toContain('translations.en.name_1');
		expect(names).not.toContain('translations.pt.name_1');

		const enIndex = indexes.find((index) => index.name === UNIT_TRANSLATIONS_EN_NAME_UNIQUE_INDEX);
		const ptIndex = indexes.find((index) => index.name === UNIT_TRANSLATIONS_PT_NAME_UNIQUE_INDEX);
		expect(enIndex?.key).toEqual({ 'translations.en.name': 1 });
		expect(enIndex?.unique).toBe(true);
		expect(ptIndex?.key).toEqual({ 'translations.pt.name': 1 });
		expect(ptIndex?.unique).toBe(true);
	});

	it('does not enforce uniqueness on name_plural', async () => {
		await UnitModel.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));
		// Same name_plural values, distinct names, must both persist.
		await expect(
			UnitModel.create({
				translations: {
					en: { name: 'centiliter', name_plural: 'milliliters' },
					pt: { name: 'centilitro', name_plural: 'mililitros' },
				},
				allow_decimal: true,
				kind: 'volume',
			}),
		).resolves.toBeDefined();
	});

	it('rejects an out-of-enum kind at the Mongoose boundary', async () => {
		await expect(
			UnitModel.create({ ...buildUnit({ en: 'piece', pt: 'peça' }), kind: 'length' as never }),
		).rejects.toThrow();
	});

	it('rejects duplicate translations.en.name and translations.pt.name with 11000', async () => {
		await UnitModel.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));

		await expect(UnitModel.create(buildUnit({ en: 'milliliter', pt: 'outro' }))).rejects.toMatchObject({
			code: 11000,
		});
		await expect(UnitModel.create(buildUnit({ en: 'other', pt: 'mililitro' }))).rejects.toMatchObject({
			code: 11000,
		});
	});

	it('preserves created_at and advances updated_at on update', async () => {
		const created = await UnitModel.create(buildUnit({ en: 'milliliter', pt: 'mililitro' }));
		const originalCreatedAt = created.created_at.getTime();
		const originalUpdatedAt = created.updated_at.getTime();

		created.allow_decimal = false;
		const updated = await created.save();

		expect(updated.created_at.getTime()).toBe(originalCreatedAt);
		expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
	});
});
