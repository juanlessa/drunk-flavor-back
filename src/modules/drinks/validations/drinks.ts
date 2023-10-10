import { z } from 'zod';
import { DRINK_ERRORS } from '../errors/drink.errors';

// fields validation
export const drinkIdValidation = z
	.string({ required_error: DRINK_ERRORS.required_id })
	.length(24, { message: DRINK_ERRORS.invalid_id_format });

export const drinkNameValidation = z
	.string({ required_error: DRINK_ERRORS.required_name })
	.trim()
	.toLowerCase()
	.min(1, { message: DRINK_ERRORS.invalid_name_format })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const drinkMethodValidation = z
	.string({ required_error: DRINK_ERRORS.required_method })
	.trim()
	.min(1, { message: DRINK_ERRORS.invalid_method_format });

export const drinkCoverValidation = z
	.string({ required_error: DRINK_ERRORS.required_cover })
	.min(1, { message: DRINK_ERRORS.invalid_cover_format });

export const drinkThumbnailValidation = z
	.string({ required_error: DRINK_ERRORS.required_thumbnail })
	.min(1, { message: DRINK_ERRORS.invalid_thumbnail_format });

export const drinkIngredientsValidation = z
	.array(
		z.object({
			ingredient_id: z
				.string({ required_error: DRINK_ERRORS.required_ingredient_id })
				.length(24, { message: DRINK_ERRORS.invalid_ingredient_id_format }),
			quantity: z
				.number({ required_error: DRINK_ERRORS.required_quantity })
				.gt(0, DRINK_ERRORS.invalid_quantity_format)
		})
	)
	.min(1, { message: DRINK_ERRORS.required_ingredients });

// schemas
export const drinkTranslationSchema = z.object({
	name: drinkNameValidation,
	method: drinkMethodValidation
});
