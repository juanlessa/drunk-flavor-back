import { CollationOptions } from 'mongodb';
import { Model, QueryFilter } from 'mongoose';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { QueryParams, SortOrder } from '@/shared/types/query.types';
import { escapeRegExp } from '@/shared/helpers/regex.helpers';
import { tokenizeSearchText } from '@/shared/helpers/search.helpers';
import { SEARCH_KEYS_FIELD } from '../constants/search.constants';

/**
 * Constructs a Mongoose query based on provided parameters.
 *
 * @param queryParams - The query parameters including limit, page, search, and sort options.
 * @param model - The Mongoose model to query.
 * @returns A Mongoose query.
 */
export const buildQuery = <T>(
	queryParams: QueryParams,
	model: Model<T>,
	options: { collation?: CollationOptions } = {},
) => {
	const { limit = DEFAULT_QUERY_PARAMS.limit, page = DEFAULT_QUERY_PARAMS.page, search, sort } = queryParams;
	const skip = (page - 1) * limit;

	const searchConditions: Record<string, RegExp | { $all: RegExp[] }> = {};
	if (search) {
		for (const [field, term] of Object.entries(search)) {
			if (term === undefined) continue;
			if (field === SEARCH_KEYS_FIELD) {
				// Every word of the term must be the prefix of one of the normalized search keys.
				const tokens = tokenizeSearchText(term);
				if (tokens.length > 0) {
					searchConditions[field] = { $all: tokens.map((token) => new RegExp(`^${escapeRegExp(token)}`)) };
				}
				continue;
			}
			searchConditions[field] = new RegExp(escapeRegExp(term), 'i');
		}
	}

	let query = model
		.find(searchConditions as QueryFilter<T>)
		.limit(limit)
		.skip(skip);

	if (sort) {
		const sortOptions: Record<string, SortOrder> = {};
		for (const [field, order] of Object.entries(sort)) {
			if (order !== undefined) {
				sortOptions[field] = order;
			}
		}
		// Append `_id` as a deterministic tie-breaker so documents sharing the
		// primary sort-key value keep a stable order across pages. Only applied
		// when a sort is supplied, preserving natural order for unsorted reads,
		// and skipped when the caller already sorts by `_id`.
		if (!('_id' in sortOptions)) {
			sortOptions._id = -1;
		}
		query = query.sort(sortOptions);
	}

	if (options.collation) {
		query = query.collation(options.collation);
	}

	return query;
};
