import { commentContentValidation, commentIdValidation } from '@/core/engagement/schemas/comment.schemas';
import { z } from 'zod/v4';

export const updateCommentParamsSchema = z.object({
	id: commentIdValidation,
});

export const updateCommentBodySchema = z
	.object({
		content: commentContentValidation,
	})
	.strict();
