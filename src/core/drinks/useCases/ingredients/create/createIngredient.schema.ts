import { IngredientKinds } from '@/core/drinks/entities/ingredient.entity';
import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import {
	ingredientBrandValidation,
	ingredientCategoryIdValidation,
	ingredientKindValidation,
	ingredientTranslationSchema,
	ingredientUnitIdValidation,
	refineIngredientBrand,
} from '@/core/drinks/schemas/ingredient.schemas';
import { z } from 'zod/v4';

export const createIngredientSchema = z
	.object({
		translations: generateTranslationsSchema(ingredientTranslationSchema),
		categoryId: ingredientCategoryIdValidation,
		unitId: ingredientUnitIdValidation,
		kind: ingredientKindValidation.default(IngredientKinds.generic),
		brand: ingredientBrandValidation.optional(),
	})
	.superRefine(refineIngredientBrand);
