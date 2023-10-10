import { z } from 'zod';
import { CATEGORY_ERRORS } from '../errors/category.errors';

// fields validation
export const categoryIdValidation = z
	.string({ required_error: CATEGORY_ERRORS.required_id })
	.length(24, { message: CATEGORY_ERRORS.invalid_id_format });

export const categoryNameValidation = z
	.string({ required_error: CATEGORY_ERRORS.required_name })
	.trim()
	.toLowerCase()
	.min(1, { message: CATEGORY_ERRORS.invalid_name_format })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

// schemas
export const categoryTranslationSchema = z.object({
	name: categoryNameValidation
});
