import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { normalizeSortOrder } from '@/shared/helpers/sort.helpers';
import { SortOrder } from '@/shared/types/query.types';

type RatingClientSort = Partial<Record<'created_at' | 'updated_at' | 'value', SortOrder | undefined>>;

/**
 * Converts the client Rating sort aliases into explicit `1 | -1` directions, defaults to
 * newest-first when no client sort is present, and always appends the server-owned `_id: -1`
 * tie-breaker last so Mongo and in-memory ordering stay deterministic.
 */
export const normalizeRatingSort = (sort?: RatingClientSort): RatingListQuery['sort'] => {
	const normalized: Record<string, 1 | -1> = {};

	if (sort) {
		for (const [field, order] of Object.entries(sort)) {
			if (order !== undefined) {
				normalized[field] = normalizeSortOrder(order);
			}
		}
	}

	if (Object.keys(normalized).length === 0) {
		normalized.created_at = -1;
	}

	normalized._id = -1;

	return normalized;
};
