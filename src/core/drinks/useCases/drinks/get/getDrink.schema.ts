import { z } from 'zod';
import { drinkIdValidation } from '@/core/drinks/schemas/drink.schemas';

export const getDrinkSchema = z.object({
	id: drinkIdValidation,
});
