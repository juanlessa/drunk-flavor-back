import { ICategory } from '@modules/drinks/entities/category.entity';
import { DatabaseCommonInfo } from '@shared/infra/database/mongo/types';
import { ITranslations } from '../types/translations';

export type IIngredientTranslation = {
	name: string;
	unit: string;
	unit_plural: string;
};

export type IIngredient = DatabaseCommonInfo & {
	translations: ITranslations<IIngredientTranslation>;
	category: ICategory;
	is_alcoholic: boolean;
};
