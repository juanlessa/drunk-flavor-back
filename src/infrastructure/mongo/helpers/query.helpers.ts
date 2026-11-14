import { CollationOptions } from 'mongodb';
import { Model, PipelineStage, QueryFilter } from 'mongoose';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { QueryParams, SortOrder } from '@/shared/types/query.types';
import { escapeRegExp } from '@/shared/helpers/regex.helpers';
import { tokenizeSearchTerm } from '@/shared/helpers/search.helpers';
import {
	SEARCH_KEYS_FIELD,
	SEARCH_RANK_FIELD,
	SEARCH_TIERS_FIELD,
	SEARCH_TIER_COUNT,
} from '../constants/search.constants';

export type BuildQueryOptions<T> = {
	collation?: CollationOptions;
	/** Extra conditions every returned document must also match, on top of the search. */
	filter?: QueryFilter<T>;
	/** Replaces the pagination derived from the `limit` and `page` of the query parameters. */
	pagination?: { skip: number; limit: number };
};

export type FindPageOptions<T> = BuildQueryOptions<T> & {
	/**
	 * Orders the documents that matched a search of the search keys by relevance, using the tiers they store
	 * (`SEARCH_TIERS_FIELD`). The sort of the query parameters then only breaks the ties between equally ranked ones.
	 */
	ranked?: boolean;
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

/** The words of the search keys term of a query that can be ranked, none when the query has no such term. */
const getRankedTokens = (search: QueryParams['search']): string[] => {
	const term = search?.[SEARCH_KEYS_FIELD];
	return term === undefined ? [] : tokenizeSearchTerm(term);
};

/** Whether any key of the tier starts with the word. */
const tierHasWord = (tierIndex: number, token: string) => ({
	$anyElementTrue: [
		{
			$map: {
				input: { $ifNull: [{ $arrayElemAt: [`$${SEARCH_TIERS_FIELD}`, tierIndex] }, []] },
				as: 'key',
				in: { $regexMatch: { input: '$$key', regex: `^${escapeRegExp(token)}` } },
			},
		},
	],
});

/**
 * The relevance rank of a document for the words of a search: each word ranks as the first tier that has it (a number
 * from 1), and the document ranks as its worst word. A document stored without tiers ranks after every tier.
 */
const buildRankExpression = (tokens: string[]) => ({
	$max: tokens.map((token) => ({
		$switch: {
			branches: Array.from({ length: SEARCH_TIER_COUNT }, (_, tierIndex) => ({
				case: tierHasWord(tierIndex, token),
				then: tierIndex + 1,
			})),
			default: SEARCH_TIER_COUNT + 1,
		},
	})),
});

/** The fields a query leaves out when it reads documents (`select: false`), which an aggregation would return. */
const getHiddenFields = <T>(model: Model<T>): string[] => {
	const hidden: string[] = [];
	model.schema.eachPath((path, type) => {
		if (type.options?.select === false) hidden.push(path);
	});
	return hidden;
};

const isAscending = (order: SortOrder): boolean => order === 'asc' || order === 'ascending' || order === 1;

/**
 * Reads a page of documents ordered by the relevance of their match: the rank comes first and the sort of the query
 * parameters breaks the ties. The rank is worked out for the documents that matched only, and the match itself is the
 * same indexed one of `buildQuery`; but sorting by it cannot use an index, so it fits a search, not a full listing.
 */
const findRankedPage = async <T>(
	queryParams: QueryParams,
	model: Model<T>,
	tokens: string[],
	options: FindPageOptions<T>,
): Promise<T[]> => {
	const { limit = DEFAULT_QUERY_PARAMS.limit, page = DEFAULT_QUERY_PARAMS.page, search, sort } = queryParams;
	const pagination = options.pagination ?? { skip: (page - 1) * limit, limit };

	const sortStage: Record<string, 1 | -1> = { [SEARCH_RANK_FIELD]: 1 };
	for (const [field, order] of Object.entries(sort ?? {})) {
		if (order !== undefined) sortStage[field] = isAscending(order) ? 1 : -1;
	}
	// Deterministic tie-breaker, as `buildQuery` does: newest first after a sort, the natural order without one.
	if (!('_id' in sortStage)) sortStage._id = sort ? -1 : 1;

	const pipeline: PipelineStage[] = [
		{ $match: { ...buildSearchConditions(search), ...options.filter } as Record<string, unknown> },
		{ $addFields: { [SEARCH_RANK_FIELD]: buildRankExpression(tokens) } },
		{ $sort: sortStage },
		{ $skip: pagination.skip },
		{ $limit: pagination.limit },
		{ $project: Object.fromEntries([...getHiddenFields(model), SEARCH_RANK_FIELD].map((field) => [field, 0])) },
	];
	const aggregate = model.aggregate<T>(pipeline);
	if (options.collation) aggregate.collation(options.collation);
	return aggregate.exec();
};

/**
 * Reads a page of documents (as plain objects) in the order of the query. With `ranked`, a search of the search keys
 * orders the documents by relevance first; otherwise, and for a query without such a search, it is a plain `find`.
 */
export const findPage = async <T>(
	queryParams: QueryParams,
	model: Model<T>,
	options: FindPageOptions<T> = {},
): Promise<T[]> => {
	const tokens = options.ranked ? getRankedTokens(queryParams.search) : [];
	if (tokens.length === 0) return buildQuery<T>(queryParams, model, options).lean<T[]>().exec();
	return findRankedPage(queryParams, model, tokens, options);
};

/**
 * Lists a page of documents with the ones that belong to `ownerId` first, each group in the order of the query.
 *
 * It does not sort by a computed field (that would need an aggregation and could not use an index), unless the query
 * asks for the documents to be ranked by the relevance of a search, which `findPage` does for each group. It counts
 * the owner's documents, then takes the page from them while there are any left and fills it with the others, so every
 * page costs one count and at most two queries.
 *
 * @param queryParams - The query parameters, whose search, sort, limit and page apply to both groups.
 * @param model - The Mongoose model to query.
 * @param ownerId - Whose documents come first.
 * @param ownerField - The persisted field that holds the owner of a document.
 * @param options - A collation, extra conditions and the ranking that apply to both groups.
 */
export const findOwnedFirst = async <T>(
	queryParams: QueryParams,
	model: Model<T>,
	ownerId: string,
	ownerField: string,
	options: Pick<FindPageOptions<T>, 'collation' | 'filter' | 'ranked'> = {},
): Promise<T[]> => {
	const { limit = DEFAULT_QUERY_PARAMS.limit, page = DEFAULT_QUERY_PARAMS.page, search } = queryParams;
	const offset = (page - 1) * limit;
	const owned = { ...options.filter, [ownerField]: ownerId } as QueryFilter<T>;
	const ownedCount = await model
		.countDocuments({ ...buildSearchConditions(search), ...owned } as QueryFilter<T>)
		.exec();

	const ownedPage =
		offset < ownedCount
			? await findPage<T>(queryParams, model, {
					...options,
					filter: owned,
					pagination: { skip: offset, limit },
				})
			: [];
	const missing = limit - ownedPage.length;
	if (missing <= 0) return ownedPage;

	// `$ne` also matches the documents without an owner, e.g. those whose author closed the account.
	const others = { ...options.filter, [ownerField]: { $ne: ownerId } } as QueryFilter<T>;
	const othersPage = await findPage<T>(queryParams, model, {
		...options,
		filter: others,
		pagination: { skip: Math.max(0, offset - ownedCount), limit: missing },
	});
	return [...ownedPage, ...othersPage];
};
