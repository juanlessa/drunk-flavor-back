import { DatabaseCommonInfo } from '@shared/infra/database/mongo/types';
import { IIngredient } from './ingredient.entity';
import { ITranslations } from '../types/translations';

export type IDrinkTranslation = {
	name: string;
	method: string;
};

export type IDrinkIngredient = {
	quantity: number;
	ingredient: IIngredient;
};

export type IDrink = DatabaseCommonInfo & {
	translations: ITranslations<IDrinkTranslation>;
	cover: string;
	thumbnail: string;
	ingredients: IDrinkIngredient[];
};
