import { commentIdValidation } from '@/core/engagement/schemas/comment.schemas';
import { z } from 'zod/v4';

export const getCommentSchema = z.object({
	id: commentIdValidation,
});
