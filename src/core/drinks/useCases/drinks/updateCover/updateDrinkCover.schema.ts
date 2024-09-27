import { z } from 'zod';
import { drinkIdValidation } from '@/core/drinks/schemas/drink.schemas';

export const updateDrinkCoverSchema = z.object({
	id: drinkIdValidation,
});
