import { Languages, Translations } from '@/core/drinks/types/translations';
import { buildSearchKeys, getSearchRank, matchesSearchTerm, tokenizeSearchTerm } from '@/shared/helpers/search.helpers';

type PartialTranslations = Partial<Record<keyof Translations<unknown>, Record<string, unknown> | undefined>>;

type TranslationsSearchKeysOptions = {
	/** Translation fields whose stop words are left out (free-text fields such as descriptions). */
	stopWordFields?: readonly string[];
};

/**
 * Builds the search keys of an entity from the given fields of every language,
 * plus any extra language-independent values (e.g. a unit symbol).
 */
export const buildTranslationsSearchKeys = (
	translations: PartialTranslations | undefined,
	fields: readonly string[],
	extraValues: readonly (string | null | undefined)[] = [],
	{ stopWordFields = [] }: TranslationsSearchKeysOptions = {},
): string[] => {
	const languages = Object.keys(Languages) as (keyof Translations<unknown>)[];
	const valuesOf = (fieldList: readonly string[]) =>
		languages.flatMap((language) =>
			fieldList.map((field) => {
				const value = translations?.[language]?.[field];
				return typeof value === 'string' ? value : undefined;
			}),
		);
	const regularFields = fields.filter((field) => !stopWordFields.includes(field));
	const freeTextFields = fields.filter((field) => stopWordFields.includes(field));
	return [
		...new Set([
			...buildSearchKeys([...valuesOf(regularFields), ...extraValues]),
			...buildSearchKeys(valuesOf(freeTextFields), { ignoreStopWords: true }),
		]),
	];
};

export const NAME_SEARCH_FIELDS = ['name'] as const;
export const UNIT_SEARCH_FIELDS = ['name', 'namePlural'] as const;
export const UNIT_PERSISTENCE_SEARCH_FIELDS = ['name', 'name_plural'] as const;

const DESCRIPTION_SEARCH_FIELDS = ['description'] as const;
const DESCRIPTION_SEARCH_OPTIONS = { stopWordFields: DESCRIPTION_SEARCH_FIELDS } as const;

/** The search keys of every tier, from the most to the least relevant one. */
export type SearchTiers = string[][];

/** Keeps each key only in the first tier that has it, so a tier holds what is new compared to the more relevant ones. */
const dedupeAcrossTiers = (tiers: SearchTiers): SearchTiers => {
	const seen = new Set<string>();
	return tiers.map((keys) => {
		const fresh = keys.filter((key) => !seen.has(key));
		fresh.forEach((key) => seen.add(key));
		return fresh;
	});
};

/** Every key of every tier: what a search term is matched against, whichever tier a word ends up ranking in. */
export const flattenSearchTiers = (tiers: SearchTiers): string[] => [...new Set(tiers.flat())];

/**
 * The search keys of an ingredient by relevance: 1) its name, 2) its description and brand, 3) the name of its category.
 * Both translations are the shape of the entity or of its stored form, as the fields searched have the same names.
 */
export const buildIngredientSearchTiers = (
	translations: PartialTranslations | undefined,
	brand: string | null | undefined,
	categoryTranslations: PartialTranslations | undefined,
): SearchTiers =>
	dedupeAcrossTiers([
		buildTranslationsSearchKeys(translations, NAME_SEARCH_FIELDS),
		buildTranslationsSearchKeys(translations, DESCRIPTION_SEARCH_FIELDS, [brand], DESCRIPTION_SEARCH_OPTIONS),
		buildTranslationsSearchKeys(categoryTranslations, NAME_SEARCH_FIELDS),
	]);

/** The part of a recipe line that the search of a drink looks at: the ingredient and its category. */
export type DrinkSearchLine = {
	ingredient: { translations?: PartialTranslations; category?: { translations?: PartialTranslations } };
};

/**
 * The search keys of a drink by relevance: 1) its name, 2) the name of its ingredients, 3) the name of the category of
 * its ingredients. A drink has no category of its own, and the garnishes, descriptions and brands are not searched.
 */
export const buildDrinkSearchTiers = (
	translations: PartialTranslations | undefined,
	ingredients: readonly DrinkSearchLine[],
): SearchTiers => {
	const keysOf = (pick: (line: DrinkSearchLine) => PartialTranslations | undefined) => [
		...new Set(ingredients.flatMap((line) => buildTranslationsSearchKeys(pick(line), NAME_SEARCH_FIELDS))),
	];
	return dedupeAcrossTiers([
		buildTranslationsSearchKeys(translations, NAME_SEARCH_FIELDS),
		keysOf(({ ingredient }) => ingredient.translations),
		keysOf(({ ingredient }) => ingredient.category?.translations),
	]);
};

/**
 * Creates the custom matchers used by the in-memory repositories to mirror the persisted
 * search keys: the `name` search term is matched against the keys computed from each item.
 */
export const createNameSearchMatchers = <T>(
	getKeys: (item: T) => string[],
): Record<string, (item: T, term: string) => boolean> => ({
	name: (item, term) => matchesSearchTerm(getKeys(item), term),
});

/**
 * Orders the items that matched a name term by relevance, the best ranked first. The order the items already have is
 * kept among the ones of the same rank, so a sort applied before it works as the tie-breaker, as it does in the
 * database. Without a term with searchable words nothing is reordered.
 */
export const rankByNameSearch = <T>(items: T[], term: string | undefined, getTiers: (item: T) => SearchTiers): T[] => {
	if (term === undefined || tokenizeSearchTerm(term).length === 0) return items;
	return items
		.map((item) => ({ item, rank: getSearchRank(getTiers(item), term) ?? Number.POSITIVE_INFINITY }))
		.sort((a, b) => a.rank - b.rank)
		.map(({ item }) => item);
};
