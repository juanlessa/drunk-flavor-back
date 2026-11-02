import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	ingredientCategoryIdValidation,
	ingredientTranslationSchema,
	ingredientUnitIdValidation,
} from '@/core/drinks/schemas/ingredient.schemas';
import { z } from 'zod/v4';

export const createIngredientSchema = z.object({
	translations: generateTranslationsSchema(ingredientTranslationSchema),
	categoryId: ingredientCategoryIdValidation,
	unitId: ingredientUnitIdValidation,
});
