import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	ingredientCategoryIdValidation,
	ingredientTranslationSchema,
	ingredientUnitIdValidation,
} from '@/core/drinks/schemas/ingredient.schemas';
import { z } from 'zod/v4';

export const createIngredientSchema = z.object({
	translations: generateTranslationsSchema(ingredientTranslationSchema),
	category_id: ingredientCategoryIdValidation,
	unit_id: ingredientUnitIdValidation,
});
