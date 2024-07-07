import { Category } from './category.entity';
import { DatabaseCommonInfo } from '@/shared/infra/mongo/types';
import { Translations } from '@/modules/drinks/types/translations';

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
