import { z } from 'zod';
import { ingredientIdValidation } from '@/modules/drinks/schemas/ingredient.schemas';

export const getIngredientSchema = z.object({
	id: ingredientIdValidation,
});
