import {
	DrinkIngredientAmountTypes,
	DrinkIngredientQualifiers,
	DrinkIngredientRoles,
} from '@/core/drinks/constants/drink.constants';
import { Translations } from '@/core/drinks/types/translations';
import { EntityMetadata } from '@/shared/types/entity.types';
import { FileMetadata } from '@/shared/types/file.types';
import { Ingredient } from './ingredient.entity';
import { Unit } from './unit.entity';

export type DrinkTranslation = {
	name: string;
	method: string;
};

export type DrinkIngredientRole = (typeof DrinkIngredientRoles)[keyof typeof DrinkIngredientRoles];

export type DrinkIngredientQualifier = (typeof DrinkIngredientQualifiers)[keyof typeof DrinkIngredientQualifiers];

export type DrinkIngredientAmountType = (typeof DrinkIngredientAmountTypes)[keyof typeof DrinkIngredientAmountTypes];

/**
 * The amount of an ingredient within a drink.
 * - `exact`: a precise `quantity` in `unit` (e.g. 50 ml).
 * - `qualitative`: a `qualifier` with an optional approximate `quantity`/`unit` hint (e.g. top up, ≈ 120 ml).
 * - `none`: no amount applies (e.g. ginger foam, a garnish).
 *
 * `unit` is a snapshot of one of the ingredient's units, resolved at write time.
 */
export type DrinkIngredientAmount =
	| { type: typeof DrinkIngredientAmountTypes.exact; quantity: number; unit: Unit }
	| {
			type: typeof DrinkIngredientAmountTypes.qualitative;
			qualifier: DrinkIngredientQualifier;
			quantity?: number;
			unit?: Unit;
	  }
	| { type: typeof DrinkIngredientAmountTypes.none };

export type DrinkIngredient = {
	ingredient: Ingredient;
	role: DrinkIngredientRole;
	amount: DrinkIngredientAmount;
	optional: boolean;
};

export type Drink = EntityMetadata & {
	translations: Translations<DrinkTranslation>;
	cover?: FileMetadata;
	thumbnail?: FileMetadata;
	ingredients: DrinkIngredient[];
	avgRating: number;
	ratingsCount: number;
	ratingsSum: number;
};
