import { DatabaseCommonInfo } from '@/shared/infra/mongo/types';
import { Ingredient } from './ingredient.entity';
import { Translations } from '@/modules/drinks/types/translations';

export type DrinkTranslation = {
	name: string;
	method: string;
};

export type DrinkIngredient = {
	quantity: number;
	ingredient: Ingredient;
};

export type Drink = DatabaseCommonInfo & {
	translations: Translations<DrinkTranslation>;
	cover: string;
	thumbnail: string;
	ingredients: DrinkIngredient[];
};
