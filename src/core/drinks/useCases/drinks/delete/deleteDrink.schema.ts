import { drinkIdValidation } from '@/core/drinks/schemas/drink.schemas';
import { z } from 'zod';

export const deleteDrinkSchema = z.object({
	id: drinkIdValidation,
});
