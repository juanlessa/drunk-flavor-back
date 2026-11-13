import { CategoryTranslation } from '@/core/drinks/entities/category.entity';
import { Translations } from '@/core/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

export type CategoryData = {
	translations: Translations<CategoryTranslation>;
	isAlcoholic: boolean;
};

/** `createdBy` is set once, when the category is created, and is never part of an update. */
export type CreateCategory = CategoryData & { createdBy: string };

export type UpdateCategory = { id: string; updatedBy: string } & DeepPartial<CategoryData>;
export type FindCategoryByName = DeepPartial<Translations<{ name: string }>>;
