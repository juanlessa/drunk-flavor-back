import { Category } from './category.entity';
import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { Translations } from '@/core/drinks/types/translations';

export type IngredientTranslation = {
	name: string;
	unit: string;
	unit_plural: string;
};

export type Ingredient = DatabaseCommonInfo & {
	translations: Translations<IngredientTranslation>;
	is_alcoholic: boolean;
	category: Category;
};
