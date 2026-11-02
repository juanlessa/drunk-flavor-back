import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';

export type CategoryTranslation = {
	name: string;
};

export type Category = EntityMetadata & {
	translations: Translations<CategoryTranslation>;
	isAlcoholic: boolean;
};
