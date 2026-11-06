import { Languages, Translations } from '@/core/drinks/types/translations';
import { buildSearchKeys, matchesSearchTerm } from '@/shared/helpers/search.helpers';

type PartialTranslations = Partial<Record<keyof Translations<unknown>, Record<string, unknown> | undefined>>;

/**
 * Builds the search keys of an entity from the given fields of every language,
 * plus any extra language-independent values (e.g. a unit symbol).
 */
export const buildTranslationsSearchKeys = (
	translations: PartialTranslations | undefined,
	fields: readonly string[],
	extraValues: readonly (string | null | undefined)[] = [],
): string[] => {
	const languages = Object.keys(Languages) as (keyof Translations<unknown>)[];
	const values = languages.flatMap((language) =>
		fields.map((field) => {
			const value = translations?.[language]?.[field];
			return typeof value === 'string' ? value : undefined;
		}),
	);
	return buildSearchKeys([...values, ...extraValues]);
};

export const NAME_SEARCH_FIELDS = ['name'] as const;
export const INGREDIENT_SEARCH_FIELDS = ['name', 'description'] as const;
export const UNIT_SEARCH_FIELDS = ['name', 'namePlural'] as const;
export const UNIT_PERSISTENCE_SEARCH_FIELDS = ['name', 'name_plural'] as const;

/**
 * Creates the custom matchers used by the in-memory repositories to mirror the persisted
 * search keys: the `name` search term is matched against the keys computed from each item.
 */
export const createNameSearchMatchers = <T>(
	getKeys: (item: T) => string[],
): Record<string, (item: T, term: string) => boolean> => ({
	name: (item, term) => matchesSearchTerm(getKeys(item), term),
});
