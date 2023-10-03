import { validateSchema } from '@middlewares/fieldsValidator';
import { IUpdateIngredientRequest } from '@modules/drinks/dtos/ingredient.dtos';
import { getZodTranslationsSchema } from '@modules/drinks/validations/getZodTranslationsSchema';
import {
	ingredientCategoryIdValidation,
	ingredientIdValidation,
	ingredientIsAlcoholicValidation,
	ingredientTranslationSchema
} from '@modules/drinks/validations/ingredients';
import { z } from 'zod';

const updateIngredientSchema = z.object({
	id: ingredientIdValidation,
	translations: getZodTranslationsSchema(ingredientTranslationSchema),
	is_alcoholic: ingredientIsAlcoholicValidation,
	category_id: ingredientCategoryIdValidation
});

export const updateIngredientValidator = validateSchema<IUpdateIngredientRequest>(updateIngredientSchema);
