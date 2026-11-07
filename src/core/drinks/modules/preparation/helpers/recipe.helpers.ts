import { RecipeItemRef } from '@/core/drinks/modules/preparation/entities/recipeItemRef.entity';
import {
	PreparationRecipeItem,
	PreparationUnit,
} from '@/core/drinks/modules/preparation/entities/preparationDrink.entity';
import { RecipeList } from '@/core/drinks/modules/preparation/types/technique.types';

const NO_UNIT = 'none';

/**
 * Identity of a recipe line within its list: the ingredient plus the unit it is measured in.
 * A line with no unit (`none`, or a qualitative without a unit) shares a single "no unit" slot.
 *
 * It is the same rule as `getRecipeItemKey` in `core/drinks/helpers/recipe.helpers`, repeated here
 * so the module does not depend on the drink entity that file imports. Keep them in sync.
 */
export const getRecipeItemKey = (ingredientId: string, unitId?: string): string =>
	`${ingredientId}:${unitId ?? NO_UNIT}`;

/** The unit a line is measured in, if any. */
export const getItemUnit = ({ amount }: PreparationRecipeItem): PreparationUnit | undefined =>
	'unit' in amount ? amount.unit : undefined;

/** The quantity of a line, if it has one. */
export const getItemQuantity = ({ amount }: PreparationRecipeItem): number | undefined =>
	'quantity' in amount ? amount.quantity : undefined;

/** The key of a line, built from the line itself. */
export const getItemKey = (item: PreparationRecipeItem): string =>
	getRecipeItemKey(item.ingredient.id, getItemUnit(item)?.id);

/** Key under which a line of a given list is tracked as used. */
export const getUsageKey = (list: RecipeList, key: string): string => `${list}|${key}`;

/** Builds the reference an action uses to point at a line of the drink. */
export const toRecipeItemRef = (
	list: RecipeList,
	item: PreparationRecipeItem,
	options: { withUnit?: boolean } = {},
): RecipeItemRef => ({
	list,
	ingredientId: item.ingredient.id,
	unitId: getItemUnit(item)?.id,
	...(options.withUnit ? { withUnit: true } : {}),
});
