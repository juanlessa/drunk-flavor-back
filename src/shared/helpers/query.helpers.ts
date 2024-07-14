import { SortOrder } from '@/shared/types/query.types';

/**
 * Filters an array of items based on the provided search criteria.
 *
 * @param items - The array of items to filter.
 * @param search - An object containing search terms where the key is the field path and the value is the search term.
 * @returns A new array of items that match the search criteria.
 */
export const filterItemsBySearchCriteria = <T>(items: T[], search: Record<string, string | undefined>): T[] => {
	return items.filter((item) => {
		return Object.entries(search).every(([field, term]) => {
			if (term === undefined) return true;
			const fields = field.split('.');
			let value: any = item;
			for (const f of fields) {
				value = value[f];
			}
			return new RegExp(term, 'i').test(value);
		});
	});
};

/**
 * Sorts an array of items based on the provided sort criteria.
 *
 * @param items - The array of items to sort.
 * @param sort - An object containing sort orders where the key is the field path and the value is the sort order.
 * @returns A new array of items sorted according to the sort criteria.
 */
export const sortItemsByFields = <T>(items: T[], sort: Record<string, SortOrder | undefined>): T[] => {
	return items.sort((a, b) => {
		for (const [field, order] of Object.entries(sort)) {
			const fields = field.split('.');
			let aValue: any = a;
			let bValue: any = b;
			for (const f of fields) {
				aValue = aValue[f];
				bValue = bValue[f];
			}
			if (aValue < bValue) return order === 'asc' || order === 1 ? -1 : 1;
			if (aValue > bValue) return order === 'asc' || order === 1 ? 1 : -1;
		}
		return 0;
	});
};

/**
 * Paginates an array of items based on the provided limit and page number.
 *
 * @param items - The array of items to paginate.
 * @param limit - The maximum number of items per page.
 * @param page - The current page number.
 * @returns A new array of items corresponding to the current page.
 */
export const paginateItems = <T>(items: T[], limit: number, page: number): T[] => {
	const skip = (page - 1) * limit;
	return items.slice(skip, skip + limit);
};
