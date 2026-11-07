import { describe, expect, it } from 'vitest';
import {
	INGREDIENT_SEARCH_FIELDS,
	INGREDIENT_SEARCH_OPTIONS,
	NAME_SEARCH_FIELDS,
	UNIT_PERSISTENCE_SEARCH_FIELDS,
	UNIT_SEARCH_FIELDS,
	buildTranslationsSearchKeys,
	createNameSearchMatchers,
} from './searchKeys.helpers';

describe('buildTranslationsSearchKeys', () => {
	it('collects the name of every language', () => {
		const keys = buildTranslationsSearchKeys(
			{ en: { name: 'Lime juice' }, pt: { name: 'Suco de limão' } },
			NAME_SEARCH_FIELDS,
		);

		expect(keys).toEqual(['lime', 'juice', 'suco', 'de', 'limao']);
	});

	it('keeps the stop words of the name but drops them from the description', () => {
		const keys = buildTranslationsSearchKeys(
			{
				en: { name: 'Coconut water', description: 'Water of the coconut' },
				pt: { name: 'Água de coco', description: 'Licor de laranja e casca' },
			},
			INGREDIENT_SEARCH_FIELDS,
			[],
			INGREDIENT_SEARCH_OPTIONS,
		);

		expect(keys).toContain('de'); // from the pt name
		expect(keys).not.toContain('of');
		expect(keys).not.toContain('the');
		expect(keys).not.toContain('e');
		expect(keys).toEqual(expect.arrayContaining(['licor', 'laranja', 'casca', 'coconut', 'water', 'coco']));
	});

	it('adds the extra language-independent values, such as a brand or a symbol', () => {
		const keys = buildTranslationsSearchKeys(
			{ en: { name: 'Gabriela' }, pt: { name: 'Gabriela' } },
			NAME_SEARCH_FIELDS,
			['Cachaça Brand', undefined, null],
		);

		expect(keys).toEqual(['gabriela', 'cachaca', 'brand']);
	});

	it('ignores missing languages, missing fields and non-text values', () => {
		expect(buildTranslationsSearchKeys(undefined, NAME_SEARCH_FIELDS)).toEqual([]);
		expect(buildTranslationsSearchKeys({ en: { name: 'Rum' } }, NAME_SEARCH_FIELDS)).toEqual(['rum']);
		expect(buildTranslationsSearchKeys({ en: { name: 10 }, pt: {} }, NAME_SEARCH_FIELDS)).toEqual([]);
	});

	it('reads the singular and plural names of a unit in both naming styles', () => {
		const domain = { en: { name: 'leaf', namePlural: 'leaves' }, pt: { name: 'folha', namePlural: 'folhas' } };
		const persistence = {
			en: { name: 'leaf', name_plural: 'leaves' },
			pt: { name: 'folha', name_plural: 'folhas' },
		};

		const expected = ['leaf', 'leaves', 'folha', 'folhas', 'ml'];
		expect(buildTranslationsSearchKeys(domain, UNIT_SEARCH_FIELDS, ['ml'])).toEqual(expected);
		expect(buildTranslationsSearchKeys(persistence, UNIT_PERSISTENCE_SEARCH_FIELDS, ['ml'])).toEqual(expected);
	});
});

describe('createNameSearchMatchers', () => {
	const matchers = createNameSearchMatchers<{ keys: string[] }>((item) => item.keys);

	it('matches the name term against the keys computed from each item', () => {
		expect(matchers.name({ keys: ['agua', 'de', 'coco'] }, 'AGUA coc')).toBe(true);
		expect(matchers.name({ keys: ['limao'] }, 'agua')).toBe(false);
	});
});
