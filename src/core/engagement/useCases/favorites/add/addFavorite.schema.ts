import { favoriteDrinkIdValidation } from '@/core/engagement/schemas/favorite.schemas';
import { z } from 'zod/v4';

export const addFavoriteSchema = z.object({
	drinkId: favoriteDrinkIdValidation,
});
