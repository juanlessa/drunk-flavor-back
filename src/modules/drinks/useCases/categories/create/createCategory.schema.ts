import { categoryTranslationSchema } from '@/modules/drinks/schemas/category.schemas';
import { generateTranslationsSchema } from '@/modules/drinks/schemas/helpers/translations.helpers';
import { z } from 'zod';

export const createCategorySchema = z.object({
	translations: generateTranslationsSchema(categoryTranslationSchema),
});
