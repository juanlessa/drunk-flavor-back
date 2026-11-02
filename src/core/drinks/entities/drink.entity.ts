import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';
import { FileMetadata } from '@/shared/types/file.types';
import { Ingredient } from './ingredient.entity';

export type DrinkTranslation = {
	name: string;
	method: string;
};

export type DrinkIngredient = {
	quantity: number;
	ingredient: Ingredient;
};

export type Drink = EntityMetadata & {
	translations: Translations<DrinkTranslation>;
	cover?: FileMetadata;
	thumbnail?: FileMetadata;
	ingredients: DrinkIngredient[];
	avgRating: number;
	ratingsCount: number;
	ratingsSum: number;
};
