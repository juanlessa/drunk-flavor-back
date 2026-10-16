import { categoryTranslationSchema } from '@/core/drinks/schemas/category.schemas';
import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { z } from 'zod/v4';

export const createCategorySchema = z.object({
	translations: generateTranslationsSchema(categoryTranslationSchema),
});
