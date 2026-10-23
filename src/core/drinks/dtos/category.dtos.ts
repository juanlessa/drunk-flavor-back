import { Translations } from '@/core/drinks/types/translations';
import { CategoryTranslation } from '@/core/drinks/entities/category.entity';
import { DeepPartial } from '@/shared/types/utility.types';

export type CreateCategory = {
	translations: Translations<CategoryTranslation>;
	is_alcoholic: boolean;
};

export type UpdateCategory = {
	id: string;
} & DeepPartial<{
	translations: Translations<CategoryTranslation>;
	is_alcoholic: boolean;
}>;

export type DeleteCategory = {
	id: string;
};

export type GetCategory = {
	id: string;
};

export type FindCategoryByName = DeepPartial<Translations<{ name: string }>>;
