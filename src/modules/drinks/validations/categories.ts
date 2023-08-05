import { z } from 'zod';
import { CATEGORY_ERRORS } from '../errors/categoryErrors';

// fields validation
const idValidation = z
	.string({ required_error: CATEGORY_ERRORS.required_id })
	.length(24, { message: CATEGORY_ERRORS.invalid_id_format });

const nameValidation = z
	.string({ required_error: CATEGORY_ERRORS.required_name })
	.trim()
	.toLowerCase()
	.min(1, { message: CATEGORY_ERRORS.invalid_name_format })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

// schemas
const createCategorySchema = z.object({
	name: nameValidation
});
const updateCategorySchema = z.object({
	id: idValidation,
	name: nameValidation
});

const deleteCategorySchema = z.object({
	id: idValidation
});

const getCategorySchema = z.object({
	id: idValidation
});

export { createCategorySchema, deleteCategorySchema, updateCategorySchema, getCategorySchema };
