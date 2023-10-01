import { ITranslations } from '@modules/drinks/types/translations';
import { ICategoryTranslation } from '@modules/drinks/entities/category.entity';

export type ICreateCategory = {
	translations: ITranslations<ICategoryTranslation>;
};

export type IUpdateCategory = {
	id: string;
	translations: ITranslations<ICategoryTranslation>;
};
export type IDeleteCategory = {
	id: string;
};

export type IGetCategory = {
	id: string;
};

export type IFindCategoryByName = ITranslations<{ name: string }>;
