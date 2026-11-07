import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	ingredientBrandValidation,
	ingredientCategoryIdValidation,
	ingredientKindValidation,
	ingredientTranslationSchema,
	ingredientUnitIdsValidation,
	refineIngredientBrand,
} from '@/core/drinks/schemas/ingredient.schemas';
import { z } from 'zod/v4';

export const createIngredientSchema = z
	.object({
		translations: generateTranslationsSchema(ingredientTranslationSchema),
		categoryId: ingredientCategoryIdValidation,
		unitIds: ingredientUnitIdsValidation,
		kind: ingredientKindValidation.default(IngredientKinds.generic),
		brand: ingredientBrandValidation.optional(),
	})
	.superRefine(refineIngredientBrand);
