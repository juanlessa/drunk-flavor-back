import { DatabaseCommonInfo } from '@shared/infra/database/mongo/types';
import { ITranslations } from '@modules/drinks/types/translations';

export type ICategoryTranslation = {
	name: string;
};

export type ICategory = DatabaseCommonInfo & {
	translations: ITranslations<ICategoryTranslation>;
};
