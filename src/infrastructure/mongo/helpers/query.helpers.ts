import { FilterQuery, Document, Model } from 'mongoose';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { QueryParams, SortOrder } from '@/shared/types/query.types';

/**
 * Constructs a Mongoose query based on provided parameters.
 *
 * @param queryParams - The query parameters including limit, page, search, and sort options.
 * @param model - The Mongoose model to query.
 * @returns A Mongoose FilterQuery object.
 */
export const buildQuery = <T>(queryParams: QueryParams, model: Model<Document<T>>): FilterQuery<T> => {
	const { limit = DEFAULT_QUERY_PARAMS.limit, page = DEFAULT_QUERY_PARAMS.page, search, sort } = queryParams;
	const skip = (page - 1) * limit;

	const searchConditions: FilterQuery<T> = search
		? Object.entries(search).reduce<FilterQuery<T>>((acc, [field, term]) => {
				if (term !== undefined) {
					(acc as any)[field] = new RegExp(term, 'i');
				}
				return acc;
			}, {} as FilterQuery<T>)
		: {};

	let query = model.find(searchConditions).limit(limit).skip(skip);

	if (sort) {
		const sortOptions = Object.entries(sort).reduce<Record<string, SortOrder>>(
			(acc, [field, order]) => {
				if (order !== undefined) {
					acc[field] = order;
				}
				return acc;
			},
			{} as Record<string, SortOrder>,
		);
		query = query.sort(sortOptions);
	}

	return query;
};
