import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';
import { Category } from './category.entity';
import { Unit } from './unit.entity';

export type IngredientKind = (typeof IngredientKinds)[keyof typeof IngredientKinds];

export type IngredientTranslation = {
	name: string;
	/** Short complement to the name, e.g. "Orange liqueur" for "Triple sec". */
	description?: string;
};

export type Ingredient = EntityMetadata & {
	translations: Translations<IngredientTranslation>;
	category: Category;
	/**
	 * Allowed units for this ingredient, in display order. An empty list means the ingredient
	 * is not measurable (e.g. ginger foam). A recipe picks one of these units per usage.
	 */
	units: Unit[];
	kind: IngredientKind;
	/** Brand name. Only present when `kind` is `branded`. */
	brand?: string;
};
