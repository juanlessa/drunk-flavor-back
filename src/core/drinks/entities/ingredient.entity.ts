import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';
import { Category } from './category.entity';
import { Unit } from './unit.entity';

/**
 * - `generic`: any brand works (e.g. blue curaçao, triple sec).
 * - `branded`: the recipe needs a specific brand product (e.g. Licor 43).
 */
export const IngredientKinds = {
	generic: 'generic',
	branded: 'branded',
} as const;

export type IngredientKind = (typeof IngredientKinds)[keyof typeof IngredientKinds];

export type IngredientTranslation = {
	name: string;
	/** Short complement to the name, e.g. "Orange liqueur" for "Triple sec". */
	description?: string;
};

export type Ingredient = EntityMetadata & {
	translations: Translations<IngredientTranslation>;
	category: Category;
	unit: Unit;
	kind: IngredientKind;
	/** Brand name. Only present when `kind` is `branded`. */
	brand?: string;
};
