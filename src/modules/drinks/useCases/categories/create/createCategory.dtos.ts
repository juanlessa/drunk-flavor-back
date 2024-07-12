import { z } from 'zod';
import { createCategorySchema } from './createCategory.schema';
import { Translations } from '@/modules/drinks/types/translations';
import { CategoryTranslation } from '@/modules/drinks/entities/category.entity';

export type CreateCategoryReqBody = z.infer<typeof createCategorySchema>;

export type CreateCategoryDTO = {
	translations: Translations<CategoryTranslation>;
};
