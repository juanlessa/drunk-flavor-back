import { DatabaseCommonInfo } from '@/shared/infra/mongo/types';
import { Translations } from '@/modules/drinks/types/translations';

export type CategoryTranslation = {
	name: string;
};

export type Category = DatabaseCommonInfo & {
	translations: Translations<CategoryTranslation>;
};
