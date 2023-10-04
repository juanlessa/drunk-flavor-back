import { ICategory } from '../entities/category.entity';
import { IIngredientTranslation } from '../entities/ingredient.entity';
import { ITranslations } from '../types/translations';

export type ICreateIngredientRequest = {
	translations: ITranslations<IIngredientTranslation>;
	category_id: string;
	is_alcoholic: boolean;
};

export type ICreateIngredient = {
	translations: ITranslations<IIngredientTranslation>;
	category: ICategory;
	is_alcoholic: boolean;
};

export type IUpdateIngredientRequest = {
	id: string;
	translations: ITranslations<IIngredientTranslation>;
	category_id: string;
	is_alcoholic: boolean;
};

export type IUpdateIngredient = { id: string } & Partial<{
	translations: ITranslations<IIngredientTranslation>;
	category: ICategory;
	is_alcoholic: boolean;
}>;

export type IDeleteIngredient = {
	id: string;
};

export type IGetIngredient = {
	id: string;
};

export type IFindIngredientByName = ITranslations<{ name: string }>;
