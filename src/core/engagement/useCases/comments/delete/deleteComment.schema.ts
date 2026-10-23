import { commentIdValidation } from '@/core/engagement/schemas/comment.schemas';
import { z } from 'zod/v4';

export const deleteCommentSchema = z.object({
	id: commentIdValidation,
});
