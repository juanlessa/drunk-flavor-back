import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	ingredientBrandValidation,
	ingredientCategoryIdValidation,
	ingredientIdValidation,
	ingredientKindValidation,
	ingredientUnitIdsValidation,
	ingredientUpdateTranslationSchema,
	refineIngredientBrand,
} from '@/core/drinks/schemas/ingredient.schemas';
import { z } from 'zod/v4';

export const updateIngredientSchema = z
	.object({
		id: ingredientIdValidation,
		translations: generateTranslationsSchema(ingredientUpdateTranslationSchema),
		categoryId: ingredientCategoryIdValidation,
		unitIds: ingredientUnitIdsValidation,
		// Omitted keeps the current kind and brand. A `generic` kind removes the brand.
		kind: ingredientKindValidation.optional(),
		// Omitted keeps the current brand; `null` removes it.
		brand: ingredientBrandValidation.nullable().optional(),
	})
	.superRefine(refineIngredientBrand);
