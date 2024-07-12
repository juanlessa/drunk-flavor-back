import { getZodTranslationsSchema } from '@/modules/drinks/schemas/helpers/translations.helpers';
import {
	ingredientCategoryIdValidation,
	ingredientIdValidation,
	ingredientIsAlcoholicValidation,
	ingredientTranslationSchema,
} from '@/modules/drinks/schemas/ingredient.schemas';
import { z } from 'zod';

export const updateIngredientSchema = z.object({
	id: ingredientIdValidation,
	translations: getZodTranslationsSchema(ingredientTranslationSchema),
	is_alcoholic: ingredientIsAlcoholicValidation,
	category_id: ingredientCategoryIdValidation,
});
