import { DatabaseCommonInfo } from '@shared/infra/mongo/types';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { ITranslations } from '@modules/drinks/types/translations';

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
