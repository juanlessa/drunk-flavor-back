import { CategoryTranslation } from '@/core/drinks/entities/category.entity';
import { Translations } from '@/core/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

export type CreateCategory = {
	translations: Translations<CategoryTranslation>;
	isAlcoholic: boolean;
};

export type UpdateCategory = { id: string } & DeepPartial<CreateCategory>;
export type DeleteCategory = { id: string };
export type GetCategory = { id: string };
export type FindCategoryByName = DeepPartial<Translations<{ name: string }>>;
