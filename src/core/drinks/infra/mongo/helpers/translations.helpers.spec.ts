import { describe, expect, it, vi } from 'vitest';
import {
	NAME_COLLATION_BY_LANGUAGE,
	findByTranslatedName,
	getNameUniqueIndexOptions,
	getSortCollation,
} from './translations.helpers';

describe('getNameUniqueIndexOptions', () => {
	it('builds a unique index that ignores case and diacritics for the language', () => {
		expect(getNameUniqueIndexOptions('pt', 'ingredient_pt_unique')).toEqual({
			unique: true,
			name: 'ingredient_pt_unique',
			collation: { locale: 'pt', strength: 1 },
		});
		expect(getNameUniqueIndexOptions('en', 'ingredient_en_unique').collation).toEqual({
			locale: 'en',
			strength: 1,
		});
	});
});

describe('getSortCollation', () => {
	it.each([
		{ sort: { 'translations.pt.name': 1 }, expected: { locale: 'pt' } },
		{ sort: { 'translations.en.name': -1 }, expected: { locale: 'en' } },
		{ sort: { 'translations.pt.name_plural': 1 }, expected: { locale: 'pt' } },
		{ sort: { created_at: -1, 'translations.en.name': 1 }, expected: { locale: 'en' } },
	])('uses the language of the translated sort field $sort', ({ sort, expected }) => {
		expect(getSortCollation(sort)).toEqual(expected);
	});

	it('uses the language of the first translated field when several are given', () => {
		expect(getSortCollation({ 'translations.pt.name': 1, 'translations.en.name': 1 })).toEqual({ locale: 'pt' });
	});

	it.each([
		{ title: 'no sort is given', sort: undefined },
		{ title: 'the sort has no translated field', sort: { created_at: -1, avg_rating: 1 } },
		{ title: 'the language is not supported', sort: { 'translations.fr.name': 1 } },
	])('keeps the default collation when $title', ({ sort }) => {
		expect(getSortCollation(sort)).toBeUndefined();
	});

	it('sorts with the default strength, so accented and plain letters still differ', () => {
		expect(getSortCollation({ 'translations.pt.name': 1 })).not.toHaveProperty('strength');
	});
});

describe('findByTranslatedName', () => {
	it('queries each given language with its own collation until one matches', async () => {
		const findOne = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'lime' });

		const found = await findByTranslatedName({ en: { name: 'Lime' }, pt: { name: 'Limão' } }, findOne);

		expect(found).toEqual({ id: 'lime' });
		expect(findOne).toHaveBeenNthCalledWith(1, { 'translations.en.name': 'Lime' }, NAME_COLLATION_BY_LANGUAGE.en);
		expect(findOne).toHaveBeenNthCalledWith(2, { 'translations.pt.name': 'Limão' }, NAME_COLLATION_BY_LANGUAGE.pt);
	});

	it('stops at the first language that matches', async () => {
		const findOne = vi.fn().mockResolvedValue({ id: 'lime' });

		await findByTranslatedName({ en: { name: 'Lime' }, pt: { name: 'Limão' } }, findOne);

		expect(findOne).toHaveBeenCalledTimes(1);
	});

	it('skips the languages without a name', async () => {
		const findOne = vi.fn().mockResolvedValue(null);

		const found = await findByTranslatedName({ pt: { name: 'Limão' }, en: {} }, findOne);

		expect(found).toBeNull();
		expect(findOne).toHaveBeenCalledTimes(1);
		expect(findOne).toHaveBeenCalledWith({ 'translations.pt.name': 'Limão' }, NAME_COLLATION_BY_LANGUAGE.pt);
	});

	it('does not query anything when no name is given', async () => {
		const findOne = vi.fn();

		expect(await findByTranslatedName({}, findOne)).toBeNull();
		expect(findOne).not.toHaveBeenCalled();
	});
});
