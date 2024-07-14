import { DrinkTranslation } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Translations } from '@/core/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

export type CreateDrink = {
	translations: Translations<DrinkTranslation>;
	ingredients: {
		ingredient: Ingredient;
		quantity: number;
	}[];
};

export type UpdateDrink = { id: string } & DeepPartial<{
	translations: Translations<DrinkTranslation>;
	cover: string;
	thumbnail: string;
	ingredients: {
		ingredient: Ingredient;
		quantity: number;
	}[];
}>;

export type UpdateDrinkCover = {
	id: string;
	cover: string;
};
export type UpdateDrinkThumbnail = {
	id: string;
	thumbnail: string;
};

export type DeleteDrink = {
	id: string;
};

export type GetDrink = {
	id: string;
};

export type FindDrinkByName = DeepPartial<Translations<{ name: string }>>;
