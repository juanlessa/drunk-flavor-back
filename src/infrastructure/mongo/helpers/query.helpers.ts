import { Document, Model } from 'mongoose';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { QueryParams, SortOrder } from '@/shared/types/query.types';

/**
 * Constructs a Mongoose query based on provided parameters.
 *
 * @param queryParams - The query parameters including limit, page, search, and sort options.
 * @param model - The Mongoose model to query.
 * @returns A Mongoose query.
 */
export const buildQuery = <T>(queryParams: QueryParams, model: Model<Document<T>>) => {
	const { limit = DEFAULT_QUERY_PARAMS.limit, page = DEFAULT_QUERY_PARAMS.page, search, sort } = queryParams;
	const skip = (page - 1) * limit;

	const searchConditions: Record<string, RegExp> = {};
	if (search) {
		for (const [field, term] of Object.entries(search)) {
			if (term !== undefined) {
				searchConditions[field] = new RegExp(term, 'i');
			}
		}
	}

	let query = model.find(searchConditions).limit(limit).skip(skip);

	if (sort) {
		const sortOptions: Record<string, SortOrder> = {};
		for (const [field, order] of Object.entries(sort)) {
			if (order !== undefined) {
				sortOptions[field] = order;
			}
		}
		query = query.sort(sortOptions);
	}

	return query;
};
