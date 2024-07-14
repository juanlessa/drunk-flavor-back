import { DatabaseCommonInfo } from '@/infra/mongo/types';
import { Translations } from '@/core/drinks/types/translations';

export type CategoryTranslation = {
	name: string;
};

export type Category = DatabaseCommonInfo & {
	translations: Translations<CategoryTranslation>;
};
