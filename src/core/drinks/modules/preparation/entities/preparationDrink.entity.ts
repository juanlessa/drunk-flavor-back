import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { UnitKinds } from '@/core/drinks/constants/unit.constants';
import { Translations } from '@/core/drinks/types/translations';
import { Gender } from '@/shared/types/gender.types';

/**
 * The drink as the preparation module sees it: only the recipe lines, and only the fields it reads.
 *
 * These types are structural. A full `Drink` (or any object with this shape) is accepted as is, so the
 * module never imports the drink entity and the drink entity can grow freely. If a field the module
 * reads is renamed in the entities, the call site stops compiling.
 */
export type PreparationUnit = {
	id: string;
	kind: (typeof UnitKinds)[keyof typeof UnitKinds];
	translations: Translations<{ name: string; namePlural: string; gender?: Gender }>;
};

export type PreparationIngredient = {
	id: string;
	kind: (typeof IngredientKinds)[keyof typeof IngredientKinds];
	translations: Translations<{ name: string; gender?: Gender }>;
};

export type PreparationAmount =
	| { type: typeof DrinkIngredientAmountTypes.exact; quantity: number; unit: PreparationUnit }
	| { type: typeof DrinkIngredientAmountTypes.qualitative; quantity?: number; unit?: PreparationUnit }
	| { type: typeof DrinkIngredientAmountTypes.none };

/** What an ingredient line and a garnish line have in common. */
export type PreparationRecipeItem = {
	ingredient: PreparationIngredient;
	amount: PreparationAmount;
};

export type PreparationDrinkIngredient = PreparationRecipeItem & {
	optional: boolean;
};

/** A garnish is always optional by nature. */
export type PreparationDrinkGarnish = PreparationRecipeItem;

export type PreparationDrink = {
	ingredients: PreparationDrinkIngredient[];
	garnishes: PreparationDrinkGarnish[];
};
