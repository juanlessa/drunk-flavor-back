import { SortOrder } from '@/shared/types/query.types';

/**
 * Maps a shared {@link SortOrder} value into an explicit Mongo-style direction.
 *
 * This helper is entity-agnostic: it only translates the ascending aliases (`1`, `'asc'`,
 * `'ascending'`) to `1` and every other value to `-1`, so any module can reuse it to normalize
 * client-provided sort orders into a canonical `1 | -1` direction.
 *
 * @param order - The shared sort order alias to normalize.
 * @returns `1` for ascending aliases, otherwise `-1`.
 */
export const normalizeSortOrder = (order: SortOrder): 1 | -1 => {
	if (order === 1 || order === 'asc' || order === 'ascending') return 1;
	return -1;
};
