import { CATEGORY_MESSAGES } from '@/modules/drinks/constants/categories.constants';
import { z } from 'zod';

// fields validation
export const categoryIdValidation = z
	.string({ required_error: CATEGORY_MESSAGES.requiredId.message })
	.length(24, { message: CATEGORY_MESSAGES.invalidIdFormat.message });

export const categoryNameValidation = z
	.string({ required_error: CATEGORY_MESSAGES.requiredName.message })
	.trim()
	.toLowerCase()
	.min(1, { message: CATEGORY_MESSAGES.invalidNameFormat.message })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

// schemas
export const categoryTranslationSchema = z.object({
	name: categoryNameValidation,
});
