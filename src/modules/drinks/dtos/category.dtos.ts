import { Translations } from '@/modules/drinks/types/translations';
import { CategoryTranslation } from '@/modules/drinks/entities/category.entity';
import { DeepPartial } from '@/shared/types/utility.types';

export type CreateCategory = {
	translations: Translations<CategoryTranslation>;
};

export type UpdateCategory = {
	id: string;
} & DeepPartial<{
	translations: Translations<CategoryTranslation>;
}>;

export type DeleteCategory = {
	id: string;
};

export type GetCategory = {
	id: string;
};

export type FindCategoryByName = DeepPartial<Translations<{ name: string }>>;
