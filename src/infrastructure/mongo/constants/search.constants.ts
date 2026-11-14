/** Persisted field holding the normalized tokens used for name search. */
export const SEARCH_KEYS_FIELD = 'search_keys';

/**
 * Persisted field holding the same tokens split by relevance: the first list is the most relevant tier (e.g. the name),
 * the next ones are less relevant. `SEARCH_KEYS_FIELD` stays the indexed union of every tier and decides *what* matches;
 * the tiers only decide the *order* of what matched.
 */
export const SEARCH_TIERS_FIELD = 'search_tiers';

/** How many relevance tiers a ranked search distinguishes. A word found in none of them ranks after the last tier. */
export const SEARCH_TIER_COUNT = 3;

/** Temporary field holding the relevance rank of a document while a ranked query runs. It is never returned. */
export const SEARCH_RANK_FIELD = '_search_rank';

/** Domain-level search field that is resolved against `SEARCH_KEYS_FIELD`. */
export const SEARCH_NAME_FIELD = 'name';
