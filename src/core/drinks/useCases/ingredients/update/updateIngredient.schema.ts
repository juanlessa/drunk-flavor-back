import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	ingredientCategoryIdValidation,
	ingredientIdValidation,
	ingredientTranslationSchema,
	ingredientUnitIdValidation,
} from '@/core/drinks/schemas/ingredient.schemas';
import { z } from 'zod/v4';

export const updateIngredientSchema = z.object({
	id: ingredientIdValidation,
	translations: generateTranslationsSchema(ingredientTranslationSchema),
	categoryId: ingredientCategoryIdValidation,
	unitId: ingredientUnitIdValidation,
});
