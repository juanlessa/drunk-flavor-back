import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';
import { Gender } from '@/shared/types/gender.types';
import { Category } from './category.entity';
import { Unit } from './unit.entity';

export type IngredientKind = (typeof IngredientKinds)[keyof typeof IngredientKinds];

export type IngredientTranslation = {
	name: string;

	namePlural?: string;
	description?: string;
	gender?: Gender;
};

export type Ingredient = EntityMetadata & {
	translations: Translations<IngredientTranslation>;
	category: Category;
	units: Unit[];
	kind: IngredientKind;
	brand?: string;
};
