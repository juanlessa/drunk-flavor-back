import { z } from 'zod/v4';
import { drinkIdValidation } from '@/core/drinks/schemas/drink.schemas';

export const getDrinkSchema = z.object({
	id: drinkIdValidation,
});
