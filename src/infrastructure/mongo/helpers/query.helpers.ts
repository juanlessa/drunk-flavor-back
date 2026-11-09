import { CollationOptions } from 'mongodb';
import { Model, QueryFilter } from 'mongoose';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { QueryParams, SortOrder } from '@/shared/types/query.types';
import { escapeRegExp } from '@/shared/helpers/regex.helpers';
import { tokenizeSearchTerm } from '@/shared/helpers/search.helpers';
import { SEARCH_KEYS_FIELD } from '../constants/search.constants';

export type BuildQueryOptions<T> = {
	collation?: CollationOptions;
	/** Extra conditions every returned document must also match, on top of the search. */
	filter?: QueryFilter<T>;
	/** Replaces the pagination derived from the `limit` and `page` of the query parameters. */
	pagination?: { skip: number; limit: number };
};

/** Turns the search terms of a query into the Mongo conditions that every returned document must match. */
export const buildSearchConditions = (search: QueryParams['search']): Record<string, RegExp | { $all: RegExp[] }> => {
	const searchConditions: Record<string, RegExp | { $all: RegExp[] }> = {};
	if (!search) return searchConditions;
	for (const [field, term] of Object.entries(search)) {
		if (term === undefined) continue;
		if (field === SEARCH_KEYS_FIELD) {
			// Every word of the term must be the prefix of one of the normalized search keys.
			const tokens = tokenizeSearchTerm(term);
			if (tokens.length > 0) {
				searchConditions[field] = { $all: tokens.map((token) => new RegExp(`^${escapeRegExp(token)}`)) };
			}
			continue;
		}
		searchConditions[field] = new RegExp(escapeRegExp(term), 'i');
	}
	return searchConditions;
};

/**
 * Constructs a Mongoose query based on provided parameters.
 *
 * @param queryParams - The query parameters including limit, page, search, and sort options.
 * @param model - The Mongoose model to query.
 * @param options - A collation, extra conditions and a pagination that replaces the one of the query parameters.
 * @returns A Mongoose query.
 */
export const buildQuery = <T>(queryParams: QueryParams, model: Model<T>, options: BuildQueryOptions<T> = {}) => {
	const { limit = DEFAULT_QUERY_PARAMS.limit, page = DEFAULT_QUERY_PARAMS.page, search, sort } = queryParams;
	const pagination = options.pagination ?? { skip: (page - 1) * limit, limit };

	let query = model
		.find({ ...buildSearchConditions(search), ...options.filter } as QueryFilter<T>)
		.limit(pagination.limit)
		.skip(pagination.skip);

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

/**
 * Lists a page of documents with the ones that belong to `ownerId` first, each group in the order of the query.
 *
 * It does not sort by a computed field (that would need an aggregation and could not use an index). It counts the
 * owner's documents, then takes the page from them while there are any left and fills it with the others, so every
 * page costs one count and at most two indexed `find` queries.
 *
 * @param queryParams - The query parameters, whose search, sort, limit and page apply to both groups.
 * @param model - The Mongoose model to query.
 * @param ownerId - Whose documents come first.
 * @param ownerField - The persisted field that holds the owner of a document.
 * @param options - A collation and extra conditions that apply to both groups.
 */
export const findOwnedFirst = async <T>(
	queryParams: QueryParams,
	model: Model<T>,
	ownerId: string,
	ownerField: string,
	options: Pick<BuildQueryOptions<T>, 'collation' | 'filter'> = {},
): Promise<T[]> => {
	const { limit = DEFAULT_QUERY_PARAMS.limit, page = DEFAULT_QUERY_PARAMS.page, search } = queryParams;
	const offset = (page - 1) * limit;
	const owned = { ...options.filter, [ownerField]: ownerId } as QueryFilter<T>;
	const ownedCount = await model
		.countDocuments({ ...buildSearchConditions(search), ...owned } as QueryFilter<T>)
		.exec();

	const ownedPage =
		offset < ownedCount
			? await buildQuery<T>(queryParams, model, {
					...options,
					filter: owned,
					pagination: { skip: offset, limit },
				})
					.lean<T[]>()
					.exec()
			: [];
	const missing = limit - ownedPage.length;
	if (missing <= 0) return ownedPage;

	// `$ne` also matches the documents without an owner, e.g. those whose author closed the account.
	const others = { ...options.filter, [ownerField]: { $ne: ownerId } } as QueryFilter<T>;
	const othersPage = await buildQuery<T>(queryParams, model, {
		...options,
		filter: others,
		pagination: { skip: Math.max(0, offset - ownedCount), limit: missing },
	})
		.lean<T[]>()
		.exec();
	return [...ownedPage, ...othersPage];
};
