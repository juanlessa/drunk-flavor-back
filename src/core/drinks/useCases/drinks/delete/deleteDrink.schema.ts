import { drinkIdValidation } from '@/core/drinks/schemas/drink.schemas';
import { z } from 'zod/v4';

export const deleteDrinkSchema = z.object({
	id: drinkIdValidation,
});
