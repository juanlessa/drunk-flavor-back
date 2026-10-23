import { ratingIdValidation, ratingValueValidation } from '@/core/engagement/schemas/rating.schemas';
import { z } from 'zod/v4';

export const updateRatingParamsSchema = z.object({ id: ratingIdValidation });

export const updateRatingBodySchema = z
	.object({
		value: ratingValueValidation,
	})
	.strict();
