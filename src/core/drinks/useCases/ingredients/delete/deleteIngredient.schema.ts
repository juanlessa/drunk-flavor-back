import { ingredientIdValidation } from '@/core/drinks/schemas/ingredient.schemas';
import { z } from 'zod/v4';

export const deleteIngredientSchema = z.object({
	id: ingredientIdValidation,
});
