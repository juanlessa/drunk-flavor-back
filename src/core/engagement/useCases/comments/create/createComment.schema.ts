import { commentContentValidation, commentDrinkIdValidation } from '@/core/engagement/schemas/comment.schemas';
import { z } from 'zod/v4';

export const createCommentSchema = z
	.object({
		drink_id: commentDrinkIdValidation,
		content: commentContentValidation,
	})
	.strict();
