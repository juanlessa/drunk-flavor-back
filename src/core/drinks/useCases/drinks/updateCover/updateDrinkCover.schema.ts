import { z } from 'zod/v4';
import { drinkIdValidation } from '@/core/drinks/schemas/drink.schemas';

export const updateDrinkCoverSchema = z.object({
	id: drinkIdValidation,
});
