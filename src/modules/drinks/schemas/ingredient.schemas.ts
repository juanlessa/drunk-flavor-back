import { INGREDIENT_MESSAGES } from '@/shared/constants/ResponseMessages';
import { z } from 'zod';

// Fields validation
export const ingredientIdValidation = z
	.string({ required_error: INGREDIENT_MESSAGES.requiredId.message })
	.length(24, { message: INGREDIENT_MESSAGES.invalidIdFormat.message });

export const ingredientNameValidation = z
	.string({ required_error: INGREDIENT_MESSAGES.requiredName.message })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_MESSAGES.invalidNameFormat.message })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const ingredientUnitValidation = z
	.string({ required_error: INGREDIENT_MESSAGES.requiredUnit.message })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_MESSAGES.invalidUnitFormat.message });

export const ingredientUnitPluralValidation = z
	.string({ required_error: INGREDIENT_MESSAGES.requiredUnitPlural.message })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_MESSAGES.invalidUnitPluralFormat.message });

export const ingredientCategoryIdValidation = z
	.string({ required_error: INGREDIENT_MESSAGES.requiredCategory.message })
	.length(24, { message: INGREDIENT_MESSAGES.invalidCategoryFormat.message });

export const ingredientIsAlcoholicValidation = z.boolean({
	required_error: INGREDIENT_MESSAGES.requiredIsAlcoholic.message,
});
// schemas
export const ingredientTranslationSchema = z.object({
	name: ingredientNameValidation,
	unit: ingredientUnitValidation,
	unit_plural: ingredientUnitPluralValidation,
});
