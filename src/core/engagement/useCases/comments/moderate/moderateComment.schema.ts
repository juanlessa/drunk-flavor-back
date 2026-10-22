import { commentIdValidation, commentStatusValidation } from '@/core/engagement/schemas/comment.schemas';
import { z } from 'zod/v4';

export const moderateCommentParamsSchema = z.object({ id: commentIdValidation });

export const moderateCommentBodySchema = z
	.object({
		status: commentStatusValidation,
	})
	.strict();
