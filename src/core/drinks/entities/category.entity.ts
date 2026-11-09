import { Translations } from '@/core/drinks/types/translations';
import { AuthoredEntityMetadata } from '@/shared/types/entity.types';

export type CategoryTranslation = {
	name: string;
};

export type Category = AuthoredEntityMetadata & {
	translations: Translations<CategoryTranslation>;
	isAlcoholic: boolean;
};
