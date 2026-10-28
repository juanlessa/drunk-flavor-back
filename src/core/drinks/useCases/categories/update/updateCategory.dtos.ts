import { z } from 'zod/v4';
import { CategoryTranslation } from '@/core/drinks/entities/category.entity';
import { Translations } from '@/core/drinks/types/translations';
import { updateCategorySchema } from './updateCategory.schema';

export type UpdateCategoryReqBody = z.infer<typeof updateCategorySchema>;
export type UpdateCategoryDTO = {
	id: string;
	translations: Translations<CategoryTranslation>;
	isAlcoholic: boolean;
};
