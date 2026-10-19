import { SortOrder } from '@/shared/types/query.types';
import { escapeRegExp } from '@/shared/helpers/regex.helpers';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

type Comparable = string | number;

/**
 * Compares two values using the abstract relational comparison semantics.
 *
 * The runtime values are forwarded unchanged to the native `<`/`>` operators, preserving JavaScript's
 * coercion behavior; the `Comparable` assertions only widen the static type so the operators type-check.
 *
 * @returns A negative number if `a < b`, a positive number if `a > b`, otherwise `0`.
 */
const compareValues = (a: unknown, b: unknown): number => {
	const left = a as Comparable;
	const right = b as Comparable;
	if (left < right) return -1;
	if (left > right) return 1;
	return 0;
};

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
			let value: unknown = item;
			for (const f of fields) {
				value = isRecord(value) ? value[f] : undefined;
			}
			return new RegExp(escapeRegExp(term), 'i').test(String(value));
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
			let aValue: unknown = a;
			let bValue: unknown = b;
			for (const f of fields) {
				aValue = isRecord(aValue) ? aValue[f] : undefined;
				bValue = isRecord(bValue) ? bValue[f] : undefined;
			}
			const comparison = compareValues(aValue, bValue);
			if (comparison < 0) return order === 'asc' || order === 1 ? -1 : 1;
			if (comparison > 0) return order === 'asc' || order === 1 ? 1 : -1;
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
