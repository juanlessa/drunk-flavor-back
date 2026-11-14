import { describe, expect, it } from 'vitest';
import {
	NAME_SEARCH_FIELDS,
	UNIT_PERSISTENCE_SEARCH_FIELDS,
	UNIT_SEARCH_FIELDS,
	buildDrinkSearchTiers,
	buildIngredientSearchTiers,
	buildTranslationsSearchKeys,
	createNameSearchMatchers,
	flattenSearchTiers,
	rankByNameSearch,
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
			['name', 'description'],
			[],
			{ stopWordFields: ['description'] },
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

describe('buildIngredientSearchTiers', () => {
	const category = { en: { name: 'Spirit' }, pt: { name: 'Destilado' } };

	it('ranks the name, then the description and brand, then the category', () => {
		const tiers = buildIngredientSearchTiers(
			{
				en: { name: 'Gin', description: 'Juniper flavoured' },
				pt: { name: 'Gin', description: 'Sabor de zimbro' },
			},
			'Tanqueray',
			category,
		);

		expect(tiers).toEqual([
			['gin'],
			['tanqueray', 'juniper', 'flavoured', 'sabor', 'zimbro'],
			['spirit', 'destilado'],
		]);
	});

	it('leaves the stop words of the description out but keeps the ones of the category', () => {
		const [, descriptionKeys, categoryKeys] = buildIngredientSearchTiers(
			{ en: { name: 'Water', description: 'Water of the sea' }, pt: { name: 'Água' } },
			undefined,
			{ en: { name: 'Mixer' }, pt: { name: 'Bebida de mesa' } },
		);

		expect(descriptionKeys).toEqual(['sea']);
		expect(categoryKeys).toEqual(['mixer', 'bebida', 'de', 'mesa']);
	});

	it('keeps a key only in the most relevant tier that has it', () => {
		const tiers = buildIngredientSearchTiers(
			{ en: { name: 'Lime', description: 'Lime peel' }, pt: { name: 'Limão' } },
			undefined,
			{ en: { name: 'Lime' }, pt: { name: 'Fruta' } },
		);

		expect(tiers).toEqual([['lime', 'limao'], ['peel'], ['fruta']]);
	});

	it('leaves the tiers it has no data for empty', () => {
		const tiers = buildIngredientSearchTiers({ en: { name: 'Rum' } }, undefined, undefined);

		expect(tiers).toEqual([['rum'], [], []]);
	});
});

describe('buildDrinkSearchTiers', () => {
	const line = (name: string, category: string) => ({
		ingredient: {
			translations: { en: { name, description: 'Ignored text' } },
			category: { translations: { en: { name: category } } },
		},
	});

	it('ranks the name, then the ingredients, then the categories of the ingredients', () => {
		const tiers = buildDrinkSearchTiers({ en: { name: 'Gin Tonic' } }, [
			line('Gin', 'Spirit'),
			line('Tonic water', 'Mixer'),
		]);

		expect(tiers).toEqual([['gin', 'tonic'], ['water'], ['spirit', 'mixer']]);
	});

	it('does not search the description of the ingredients', () => {
		const tiers = buildDrinkSearchTiers({ en: { name: 'Gin Tonic' } }, [line('Gin', 'Spirit')]);

		expect(flattenSearchTiers(tiers)).not.toContain('ignored');
	});

	it('collects each ingredient and category once', () => {
		const tiers = buildDrinkSearchTiers({ en: { name: 'Mule' } }, [line('Vodka', 'Spirit'), line('Rum', 'Spirit')]);

		expect(tiers).toEqual([['mule'], ['vodka', 'rum'], ['spirit']]);
	});

	it('has only the name tier for a drink without ingredients', () => {
		expect(buildDrinkSearchTiers({ en: { name: 'Water' } }, [])).toEqual([['water'], [], []]);
	});
});

describe('flattenSearchTiers', () => {
	it('joins the keys of every tier without repeating them', () => {
		expect(flattenSearchTiers([['a', 'b'], ['b', 'c'], []])).toEqual(['a', 'b', 'c']);
	});
});

describe('rankByNameSearch', () => {
	type Item = { id: string; tiers: string[][] };
	const getTiers = (item: Item) => item.tiers;
	const byName: Item = { id: 'name', tiers: [['gin'], [], []] };
	const byIngredient: Item = { id: 'ingredient', tiers: [['negroni'], ['gin'], []] };
	const byCategory: Item = { id: 'category', tiers: [['spritz'], [], ['gin']] };

	it('puts the matches of a more relevant tier first, whatever the order they came in', () => {
		const ranked = rankByNameSearch([byCategory, byIngredient, byName], 'gin', getTiers);

		expect(ranked.map(({ id }) => id)).toEqual(['name', 'ingredient', 'category']);
	});

	it('keeps the order the items had among the ones of the same rank', () => {
		const sameRank = { ...byIngredient, id: 'other' };

		const ranked = rankByNameSearch([sameRank, byName, byIngredient], 'gin', getTiers);

		expect(ranked.map(({ id }) => id)).toEqual(['name', 'other', 'ingredient']);
	});

	it('ranks an item as its worst word', () => {
		// "gin" is in the name (tier 1) and "spirit" in the category (tier 3): the item ranks 3.
		const mixed: Item = { id: 'mixed', tiers: [['gin'], [], ['spirit']] };
		const wordsInTier2: Item = { id: 'tier-2', tiers: [['gin'], ['spirit'], []] };

		const ranked = rankByNameSearch([mixed, wordsInTier2], 'gin spirit', getTiers);

		expect(ranked.map(({ id }) => id)).toEqual(['tier-2', 'mixed']);
	});

	it.each([{ term: undefined }, { term: '   ' }])('does not reorder with the term $term', ({ term }) => {
		const items = [byCategory, byName];

		expect(rankByNameSearch(items, term, getTiers)).toBe(items);
	});
});

describe('createNameSearchMatchers', () => {
	const matchers = createNameSearchMatchers<{ keys: string[] }>((item) => item.keys);

	it('matches the name term against the keys computed from each item', () => {
		expect(matchers.name({ keys: ['agua', 'de', 'coco'] }, 'AGUA coc')).toBe(true);
		expect(matchers.name({ keys: ['limao'] }, 'agua')).toBe(false);
	});
});
