import { z } from 'zod';
import { DRINK_ERRORS } from '../errors/drinkErrors';

// fields validation
const idValidation = z
	.string({ required_error: DRINK_ERRORS.required_id })
	.length(24, { message: DRINK_ERRORS.invalid_id_format });

const nameValidation = z
	.string({ required_error: DRINK_ERRORS.required_name })
	.trim()
	.toLowerCase()
	.min(1, { message: DRINK_ERRORS.invalid_name_format })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

const methodValidation = z
	.string({ required_error: DRINK_ERRORS.required_method })
	.trim()
	.min(1, { message: DRINK_ERRORS.invalid_method_format });

const coverValidation = z
	.string({ required_error: DRINK_ERRORS.required_cover })
	.min(1, { message: DRINK_ERRORS.invalid_cover_format });

const thumbnailValidation = z
	.string({ required_error: DRINK_ERRORS.required_thumbnail })
	.min(1, { message: DRINK_ERRORS.invalid_thumbnail_format });

const ingredientsValidation = z
	.array(
		z.object({
			ingredientId: z
				.string({ required_error: DRINK_ERRORS.required_ingredient_id })
				.length(24, { message: DRINK_ERRORS.invalid_ingredient_id_format }),
			quantity: z
				.number({ required_error: DRINK_ERRORS.required_quantity })
				.gt(0, DRINK_ERRORS.invalid_quantity_format)
		})
	)
	.min(1, { message: DRINK_ERRORS.required_ingredients });

// schemas
const createDrinkSchema = z.object({
	name: nameValidation,
	method: methodValidation,
	ingredients: ingredientsValidation
});

const deleteDrinkSchema = z.object({
	id: idValidation
});

const getDrinkSchema = z.object({
	id: idValidation
});

const updateDrinkSchema = z.object({
	id: idValidation,
	name: nameValidation,
	method: methodValidation,
	ingredients: ingredientsValidation
});

const updateDrinkCoverSchema = z.object({
	drinkId: idValidation,
	coverFile: coverValidation
});

const updateDrinkThumbnailSchema = z.object({
	drinkId: idValidation,
	thumbnailFile: thumbnailValidation
});

export {
	createDrinkSchema,
	deleteDrinkSchema,
	getDrinkSchema,
	updateDrinkSchema,
	updateDrinkCoverSchema,
	updateDrinkThumbnailSchema
};
