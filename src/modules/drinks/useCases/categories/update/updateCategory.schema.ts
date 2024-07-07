import { categoryIdValidation, categoryTranslationSchema } from '@/modules/drinks/schemas/category.schemas';
import { getZodTranslationsSchema } from '@/modules/drinks/schemas/helpers/translations.helpers';
import { z } from 'zod';

export const updateCategorySchema = z.object({
	id: categoryIdValidation,
	translations: getZodTranslationsSchema(categoryTranslationSchema),
});
