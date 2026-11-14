import { SEARCH_KEYS_FIELD, SEARCH_TIERS_FIELD } from '@/infrastructure/mongo/constants/search.constants';
import { SearchTiers, flattenSearchTiers } from '@/core/drinks/helpers/searchKeys.helpers';

/** The persisted search fields of a record: the indexed keys that match a search and the tiers that rank the match. */
export const toSearchFields = (tiers: SearchTiers) => ({
	[SEARCH_KEYS_FIELD]: flattenSearchTiers(tiers),
	[SEARCH_TIERS_FIELD]: tiers,
});
