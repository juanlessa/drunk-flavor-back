import { ingredientIdValidation } from '@/modules/drinks/schemas/ingredient.schemas';
import { z } from 'zod';

export const deleteIngredientSchema = z.object({
	id: ingredientIdValidation,
});
