import { Category } from './category.entity';
import { Unit } from './unit.entity';
import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { Translations } from '@/core/drinks/types/translations';

export type IngredientTranslation = {
	name: string;
};

export type Ingredient = DatabaseCommonInfo & {
	translations: Translations<IngredientTranslation>;
	is_alcoholic: boolean;
	category: Category;
	unit: Unit;
};
