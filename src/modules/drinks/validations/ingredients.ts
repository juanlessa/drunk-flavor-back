import { z } from 'zod';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';

// fields validation
export const ingredientIdValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_id })
	.length(24, { message: INGREDIENT_ERRORS.invalid_id_format });

export const ingredientNameValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_name })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_ERRORS.invalid_name_format })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const ingredientUnitValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_unit })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_ERRORS.invalid_unit_format });

export const ingredientUnityPluralValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_unit_plural })
	.trim()
	.toLowerCase()
	.min(1, { message: INGREDIENT_ERRORS.invalid_unit_plural_format });

export const ingredientCategoryIdValidation = z
	.string({ required_error: INGREDIENT_ERRORS.required_category })
	.length(24, { message: INGREDIENT_ERRORS.invalid_category_format });

export const ingredientIsAlcoholicValidation = z.boolean({ required_error: INGREDIENT_ERRORS.required_is_alcoholic });

// schemas
export const ingredientTranslationSchema = z.object({
	name: ingredientNameValidation,
	unit: ingredientUnitValidation,
	unit_plural: ingredientUnityPluralValidation
});
