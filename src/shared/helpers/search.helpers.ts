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
 * Common Portuguese and English words that carry no meaning for search (accents removed).
 * They are left out of free-text fields (e.g. descriptions) so a term like "de" does not match everything.
 */
export const STOP_WORDS: ReadonlySet<string> = new Set([
	// pt
	'a',
	'o',
	'as',
	'os',
	'um',
	'uma',
	'uns',
	'umas',
	'de',
	'da',
	'do',
	'das',
	'dos',
	'e',
	'ou',
	'em',
	'no',
	'na',
	'nos',
	'nas',
	'com',
	'para',
	'por',
	// en
	'an',
	'the',
	'of',
	'and',
	'or',
	'in',
	'on',
	'with',
	'for',
	'to',
	'from',
]);

/**
 * Tokenizes a search term ignoring stop words. When the term has only stop words
 * (e.g. "de"), they are kept so the search still narrows the results.
 *
 * @example
 * tokenizeSearchTerm('Licor de laranja'); // ['licor', 'laranja']
 * tokenizeSearchTerm('de'); // ['de']
 */
export const tokenizeSearchTerm = (term: string): string[] => {
	const tokens = tokenizeSearchText(term);
	const meaningful = tokens.filter((token) => !STOP_WORDS.has(token));
	return meaningful.length > 0 ? meaningful : tokens;
};

type BuildSearchKeysOptions = {
	/** Leaves stop words out of the generated keys. */
	ignoreStopWords?: boolean;
};

/**
 * Builds the deduplicated list of normalized tokens used to search a document.
 * Undefined, null and blank values are ignored.
 *
 * @example
 * buildSearchKeys(['Blue Curaçao', 'Curaçau Azul', undefined]); // ['blue', 'curacao', 'curacau', 'azul']
 */
export const buildSearchKeys = (
	values: readonly (string | null | undefined)[],
	{ ignoreStopWords = false }: BuildSearchKeysOptions = {},
): string[] => {
	const keys = values
		.flatMap((value) => (typeof value === 'string' ? tokenizeSearchText(value) : []))
		.filter((key) => !ignoreStopWords || !STOP_WORDS.has(key));
	return [...new Set(keys)];
};

/**
 * Checks whether every word of the term (stop words aside) is the prefix of at least one search key.
 * A term without searchable words matches everything.
 *
 * @example
 * matchesSearchTerm(['triple', 'sec'], 'tri s'); // true
 */
export const matchesSearchTerm = (searchKeys: readonly string[], term: string): boolean =>
	tokenizeSearchTerm(term).every((token) => searchKeys.some((key) => key.startsWith(token)));
