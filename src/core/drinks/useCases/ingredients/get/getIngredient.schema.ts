import { z } from 'zod/v4';
import { ingredientIdValidation } from '@/core/drinks/schemas/ingredient.schemas';

export const getIngredientSchema = z.object({
	id: ingredientIdValidation,
});
