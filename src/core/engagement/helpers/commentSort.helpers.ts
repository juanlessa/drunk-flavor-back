import { CommentListQuery } from '@/core/engagement/dtos/comment.dtos';
import { normalizeSortOrder } from '@/shared/helpers/sort.helpers';
import { SortOrder } from '@/shared/types/query.types';

type CommentClientSort = Partial<Record<'created_at' | 'updated_at', SortOrder | undefined>>;

/**
 * Comment counterpart of {@link normalizeRatingSort}. Only `created_at` and `updated_at` are
 * client-selectable; the server-owned `_id: -1` tie-breaker is always appended last.
 */
export const normalizeCommentSort = (sort?: CommentClientSort): CommentListQuery['sort'] => {
	const normalized: Record<string, 1 | -1> = {};

	if (sort) {
		for (const [field, order] of Object.entries(sort)) {
			if (order !== undefined) {
				normalized[field] = normalizeSortOrder(order);
			}
		}
	}

	if (Object.keys(normalized).length === 0) {
		normalized.created_at = -1;
	}

	normalized._id = -1;

	return normalized;
};
