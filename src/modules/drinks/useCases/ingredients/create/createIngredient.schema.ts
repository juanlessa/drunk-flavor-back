import { generateTranslationsSchema } from '@/modules/drinks/schemas/helpers/translations.helpers';
import {
	ingredientCategoryIdValidation,
	ingredientIsAlcoholicValidation,
	ingredientTranslationSchema,
} from '@/modules/drinks/schemas/ingredient.schemas';
import { z } from 'zod';

export const createIngredientSchema = z.object({
	translations: generateTranslationsSchema(ingredientTranslationSchema),
	is_alcoholic: ingredientIsAlcoholicValidation,
	category_id: ingredientCategoryIdValidation,
});
