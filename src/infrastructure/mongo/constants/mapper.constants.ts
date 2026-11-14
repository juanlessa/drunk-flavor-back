import { SEARCH_KEYS_FIELD, SEARCH_TIERS_FIELD } from './search.constants';

export const MONGO_INTERNAL_FIELDS: ReadonlySet<string> = new Set([
	'__v',
	'_doc',
	SEARCH_KEYS_FIELD,
	SEARCH_TIERS_FIELD,
]);
