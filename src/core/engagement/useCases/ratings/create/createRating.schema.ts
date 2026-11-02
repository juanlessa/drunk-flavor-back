import { ratingDrinkIdValidation, ratingValueValidation } from '@/core/engagement/schemas/rating.schemas';
import { z } from 'zod/v4';

export const createRatingSchema = z
	.object({
		drinkId: ratingDrinkIdValidation,
		value: ratingValueValidation,
	})
	.strict();
