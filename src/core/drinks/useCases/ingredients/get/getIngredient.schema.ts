import { z } from 'zod';
import { ingredientIdValidation } from '@/core/drinks/schemas/ingredient.schemas';

export const getIngredientSchema = z.object({
	id: ingredientIdValidation,
});
