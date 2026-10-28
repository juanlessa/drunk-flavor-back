import { z } from 'zod/v4';
import { CategoryTranslation } from '@/core/drinks/entities/category.entity';
import { Translations } from '@/core/drinks/types/translations';
import { createCategorySchema } from './createCategory.schema';

export type CreateCategoryReqBody = z.infer<typeof createCategorySchema>;
export type CreateCategoryDTO = { translations: Translations<CategoryTranslation>; isAlcoholic: boolean };
