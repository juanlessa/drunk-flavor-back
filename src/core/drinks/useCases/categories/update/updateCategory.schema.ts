import { categoryIdValidation, categoryTranslationSchema } from '@/core/drinks/schemas/category.schemas';
import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { z } from 'zod';

export const updateCategorySchema = z.object({
	id: categoryIdValidation,
	translations: generateTranslationsSchema(categoryTranslationSchema),
});
