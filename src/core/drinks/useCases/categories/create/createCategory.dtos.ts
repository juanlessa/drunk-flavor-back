import { z } from 'zod/v4';
import { createCategorySchema } from './createCategory.schema';
import { Translations } from '@/core/drinks/types/translations';
import { CategoryTranslation } from '@/core/drinks/entities/category.entity';

export type CreateCategoryReqBody = z.infer<typeof createCategorySchema>;

export type CreateCategoryDTO = {
	translations: Translations<CategoryTranslation>;
};
