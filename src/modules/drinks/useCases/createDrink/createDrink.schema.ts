import { validateSchema } from '@middlewares/fieldsValidator';
import { ICreateIngredient, ICreateIngredientRequest } from '@modules/drinks/dtos/ingredient.dtos';
import { getZodTranslationsSchema } from '@modules/drinks/validations/getZodTranslationsSchema';
import {
	ingredientCategoryIdValidation,
	ingredientIsAlcoholicValidation,
	ingredientTranslationSchema
} from '@modules/drinks/validations/ingredients';
import { z } from 'zod';

const createIngredientSchema = z.object({
	translations: getZodTranslationsSchema(ingredientTranslationSchema),
	is_alcoholic: ingredientIsAlcoholicValidation,
	category_id: ingredientCategoryIdValidation
});

export const createIngredientValidator = validateSchema<ICreateIngredientRequest>(createIngredientSchema);
