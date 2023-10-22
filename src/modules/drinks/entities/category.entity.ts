import { DatabaseCommonInfo } from '@shared/infra/mongo/types';
import { ITranslations } from '@modules/drinks/types/translations';

export type ICategoryTranslation = {
	name: string;
};

export type ICategory = DatabaseCommonInfo & {
	translations: ITranslations<ICategoryTranslation>;
};
