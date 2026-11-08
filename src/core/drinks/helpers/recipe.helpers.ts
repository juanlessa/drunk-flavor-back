import { DrinkGarnish, DrinkIngredient, DrinkRecipeItem } from '@/core/drinks/entities/drink.entity';
import { BadRequestError } from '@/shared/error/error.lib';

const NO_UNIT = 'none';

/**
 * Identity of a recipe line within its list: the ingredient plus the unit it is measured in.
 * A line with no unit (`none`, or a qualitative without a unit) shares a single "no unit" slot.
 *
 * It is built from plain ids so the request schema and the domain apply the very same rule.
 */
export const getRecipeItemKey = (ingredientId: string, unitId?: string): string =>
	`${ingredientId}:${unitId ?? NO_UNIT}`;

/** Indexes of the keys that already appeared earlier in the list. */
export const findDuplicateKeyIndexes = (keys: readonly string[]): number[] => {
	const seen = new Set<string>();
	return keys.flatMap((key, index) => {
		if (seen.has(key)) return [index];
		seen.add(key);
		return [];
	});
};

/** A recipe needs at least one ingredient that is not optional. */
export const hasRequiredIngredient = (ingredients: readonly { optional: boolean }[]): boolean =>
	ingredients.some(({ optional }) => !optional);

const getKeys = (items: readonly DrinkRecipeItem[]): string[] =>
	items.map(({ ingredient, amount }) =>
		getRecipeItemKey(ingredient.id, 'unit' in amount ? amount.unit?.id : undefined),
	);

/**
 * Domain invariants of a recipe, enforced whoever builds the drink (API, seed, scripts):
 * - an ingredient repeats within a list only with different units;
 * - the drink has at least one ingredient that is not optional.
 *
 * The same ingredient may appear once in `ingredients` and once in `garnishes`.
 */
export const assertValidRecipe = (
	ingredients: readonly DrinkIngredient[],
	garnishes: readonly DrinkGarnish[],
	path: string,
): void => {
	if (!hasRequiredIngredient(ingredients)) {
		throw new BadRequestError('apiResponses.drinks.requiredMainIngredient', { path });
	}
	if (
		findDuplicateKeyIndexes(getKeys(ingredients)).length > 0 ||
		findDuplicateKeyIndexes(getKeys(garnishes)).length > 0
	) {
		throw new BadRequestError('apiResponses.drinks.duplicateIngredientUnit', { path });
	}
};
