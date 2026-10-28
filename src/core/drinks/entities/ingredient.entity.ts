import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';
import { Category } from './category.entity';
import { Unit } from './unit.entity';

export type IngredientTranslation = {
	name: string;
};

export type Ingredient = EntityMetadata & {
	translations: Translations<IngredientTranslation>;
	category: Category;
	unit: Unit;
};
