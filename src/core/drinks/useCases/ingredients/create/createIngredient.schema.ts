import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { generateTranslationsSchema, requireGenderFor } from '@/core/drinks/schemas/helpers/translations.helpers';
import { Languages } from '@/core/drinks/types/translations';
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
		translations: generateTranslationsSchema(ingredientTranslationSchema).superRefine(
			requireGenderFor(Languages.pt),
		),
		categoryId: ingredientCategoryIdValidation,
		unitIds: ingredientUnitIdsValidation,
		kind: ingredientKindValidation.default(IngredientKinds.generic),
		brand: ingredientBrandValidation.optional(),
	})
	.superRefine(refineIngredientBrand);
