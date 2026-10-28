import { ratingDrinkIdValidation } from '@/core/engagement/schemas/rating.schemas';
import { z } from 'zod/v4';

export const listRatingsByDrinkSchema = z.object({
	drinkId: ratingDrinkIdValidation,
});
