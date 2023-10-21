import { validateSchema } from '@middlewares/validateSchema';
import { IDeleteIngredient } from '@modules/drinks/dtos/ingredient.dtos';
import { ingredientIdValidation } from '@modules/drinks/validations/ingredient.validations';
import { z } from 'zod';

const deleteIngredientSchema = z.object({
	id: ingredientIdValidation
});

export const deleteIngredientValidator = validateSchema<IDeleteIngredient>(deleteIngredientSchema);
