import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { normalizeSortOrder } from '@/shared/helpers/sort.helpers';
import { SortOrder } from '@/shared/types/query.types';

type CommentClientSort = Partial<Record<'createdAt' | 'updatedAt', SortOrder | undefined>>;

/**
 * Converts client sort aliases into domain field names, defaults to newest-first, and appends
 * the server-owned `id: -1` tie-breaker so Mongo and in-memory ordering stay deterministic.
 */
export const normalizeCommentSort = (sort?: CommentClientSort): CommentListQuery['sort'] => {
	const normalized: Partial<Record<'createdAt' | 'updatedAt' | 'id', 1 | -1>> = {};

	if (sort) {
		for (const [field, order] of Object.entries(sort) as [keyof CommentClientSort, SortOrder | undefined][]) {
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
