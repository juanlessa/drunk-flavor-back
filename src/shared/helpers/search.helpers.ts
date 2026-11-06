const COMBINING_MARKS = /\p{M}/gu;
const NON_ALPHANUMERIC = /[^\p{L}\p{N}]+/u;

/**
 * Normalizes text for search and comparison: lowercases, trims and strips diacritics.
 *
 * @example
 * normalizeSearchText('  Curaçau Água '); // 'curacau agua'
 */
export const normalizeSearchText = (value: string): string =>
	value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim();

/**
 * Splits text into normalized word tokens. Punctuation is treated as a separator.
 * When the text has no letters or digits (e.g. a "%" symbol), the normalized text itself is
 * returned as a single token so it stays searchable.
 *
 * @example
 * tokenizeSearchText('Triple-Sec (Licor)'); // ['triple', 'sec', 'licor']
 */
export const tokenizeSearchText = (value: string): string[] => {
	const normalized = normalizeSearchText(value);
	const tokens = normalized.split(NON_ALPHANUMERIC).filter(Boolean);
	if (tokens.length === 0 && normalized.length > 0) return [normalized];
	return tokens;
};

/**
 * Builds the deduplicated list of normalized tokens used to search a document.
 * Undefined, null and blank values are ignored.
 *
 * @example
 * buildSearchKeys(['Blue Curaçao', 'Curaçau Azul', undefined]); // ['blue', 'curacao', 'curacau', 'azul']
 */
export const buildSearchKeys = (values: readonly (string | null | undefined)[]): string[] => {
	const keys = values.flatMap((value) => (typeof value === 'string' ? tokenizeSearchText(value) : []));
	return [...new Set(keys)];
};

/**
 * Checks whether every word of the term is the prefix of at least one search key.
 * A term without searchable words matches everything.
 *
 * @example
 * matchesSearchTerm(['triple', 'sec'], 'tri s'); // true
 */
export const matchesSearchTerm = (searchKeys: readonly string[], term: string): boolean =>
	tokenizeSearchText(term).every((token) => searchKeys.some((key) => key.startsWith(token)));
