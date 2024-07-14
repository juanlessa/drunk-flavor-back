import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	ingredientCategoryIdValidation,
	ingredientIdValidation,
	ingredientIsAlcoholicValidation,
	ingredientTranslationSchema,
} from '@/core/drinks/schemas/ingredient.schemas';
import { z } from 'zod';

export const updateIngredientSchema = z.object({
	id: ingredientIdValidation,
	translations: generateTranslationsSchema(ingredientTranslationSchema),
	is_alcoholic: ingredientIsAlcoholicValidation,
	category_id: ingredientCategoryIdValidation,
});
