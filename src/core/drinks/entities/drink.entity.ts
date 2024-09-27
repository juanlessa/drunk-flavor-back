import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { Ingredient } from './ingredient.entity';
import { Translations } from '@/core/drinks/types/translations';
import { FileMetadata } from '@/shared/types/file.types';

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
	cover: FileMetadata | undefined;
	thumbnail: FileMetadata | undefined;
	ingredients: DrinkIngredient[];
};
