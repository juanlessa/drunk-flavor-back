import { COMMENT_CONTENT_MAX_LENGTH, COMMENT_CONTENT_MIN_LENGTH } from '@/core/engagement/constants/comment.constants';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { normalizeCommentSort } from '@/core/engagement/helpers/commentSort.helpers';
import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { limitSchema, pageSchema, sortOrderSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

export const commentIdValidation = getObjectIdSchema({
	required: 'apiResponses.comments.requiredId',
	invalid: 'apiResponses.comments.invalidIdFormat',
});

export const commentDrinkIdValidation = getObjectIdSchema({
	required: 'apiResponses.comments.requiredDrinkId',
	invalid: 'apiResponses.comments.invalidDrinkIdFormat',
});

export const commentContentValidation = z
	.string({ error: 'apiResponses.comments.requiredContent' satisfies LocaleKey })
	.trim()
	.min(COMMENT_CONTENT_MIN_LENGTH, { error: 'apiResponses.comments.invalidContentMin' satisfies LocaleKey })
	.max(COMMENT_CONTENT_MAX_LENGTH, { error: 'apiResponses.comments.invalidContentMax' satisfies LocaleKey });

export const commentStatusValidation = z.enum(CommentStatuses, {
	error: 'apiResponses.comments.invalidStatus' satisfies LocaleKey,
});

const commentSortSchema = z
	.object({
		created_at: sortOrderSchema,
		updated_at: sortOrderSchema,
	})
	.strict();

export const commentQuerySchema = z
	.object({
		page: pageSchema.default(DEFAULT_QUERY_PARAMS.page),
		limit: limitSchema.default(DEFAULT_QUERY_PARAMS.limit),
		sort: stringifiedJSONSchema(commentSortSchema).optional(),
	})
	.strict()
	.transform(({ page, limit, sort }) => ({
		page,
		limit,
		sort: normalizeCommentSort(sort),
	}));
