import { z } from 'zod';
import { drinkIdValidation } from '@/core/drinks/schemas/drink.schemas';

export const updateDrinkThumbnailSchema = z.object({
	id: drinkIdValidation,
});
