import { IDrinkTranslation } from '@modules/drinks/entities/drink.entity';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { ITranslations } from '@modules/drinks/types/translations';

export type ICreateDrinkRequest = {
	translations: ITranslations<IDrinkTranslation>;
	ingredients: {
		ingredient_id: string;
		quantity: number;
	}[];
};

export type ICreateDrinkResponse = {
	id: string;
};

export type ICreateDrink = {
	translations: ITranslations<IDrinkTranslation>;
	ingredients: {
		ingredient: IIngredient;
		quantity: number;
	}[];
};

export type IUpdateDrinkRequest = {
	id: string;
	translations: ITranslations<IDrinkTranslation>;
	ingredients: {
		ingredient_id: string;
		quantity: number;
	}[];
};

export type IUpdateDrink = { id: string } & Partial<{
	translations: ITranslations<IDrinkTranslation>;
	cover: string;
	thumbnail: string;
	ingredients: {
		ingredient: IIngredient;
		quantity: number;
	}[];
}>;

export type IUpdateDrinkCover = {
	drink_id: string;
	cover_file: string;
};
export type IUpdateDrinkThumbnail = {
	drink_id: string;
	thumbnail_file: string;
};

export type IDeleteDrink = {
	id: string;
};

export type IGetDrink = {
	id: string;
};

export type IFindDrinkByName = ITranslations<{ name: string }>;
