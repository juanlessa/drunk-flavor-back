import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { normalizeSortOrder } from '@/shared/helpers/sort.helpers';
import { SortOrder } from '@/shared/types/query.types';

type RatingClientSort = Partial<Record<'createdAt' | 'updatedAt' | 'value', SortOrder | undefined>>;

/**
 * Converts client sort aliases into domain field names, defaults to newest-first, and appends
 * the server-owned `id: -1` tie-breaker so Mongo and in-memory ordering stay deterministic.
 */
export const normalizeRatingSort = (sort?: RatingClientSort): RatingListQuery['sort'] => {
	const normalized: Partial<Record<'createdAt' | 'updatedAt' | 'value' | 'id', 1 | -1>> = {};

	if (sort) {
		for (const [field, order] of Object.entries(sort) as [keyof RatingClientSort, SortOrder | undefined][]) {
			if (order !== undefined) {
				normalized[field] = normalizeSortOrder(order);
			}
		}
	}

	if (Object.keys(normalized).length === 0) {
		normalized.createdAt = -1;
	}

	normalized.id = -1;
	return normalized;
};
