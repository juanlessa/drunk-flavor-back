import { favoriteDrinkIdValidation } from '@/core/engagement/schemas/favorite.schemas';
import { z } from 'zod/v4';

export const removeFavoriteSchema = z.object({
	drinkId: favoriteDrinkIdValidation,
});
