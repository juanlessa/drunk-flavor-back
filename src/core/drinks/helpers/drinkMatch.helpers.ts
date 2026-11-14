import { DrinkIngredient } from '@/core/drinks/entities/drink.entity';

/**
 * The ids of the ingredients a drink cannot be made without, in recipe order and with no repeats. The optional
 * ingredients are left out, and so are the garnishes, which are not even part of `ingredients`.
 */
export const getRequiredIngredientIds = (
	ingredients: ReadonlyArray<Pick<DrinkIngredient, 'optional'> & { ingredient: { id: string } }>,
): string[] => [...new Set(ingredients.filter(({ optional }) => !optional).map(({ ingredient }) => ingredient.id))];

/** The required ingredients that are not among the ones a person has. */
export const getMissingIngredientIds = (requiredIngredientIds: readonly string[], availableIds: ReadonlySet<string>) =>
	requiredIngredientIds.filter((id) => !availableIds.has(id));

/** The ids of every ingredient of a drink, optional or not, in recipe order and with no repeats. Garnishes are not included. */
export const getAllIngredientIds = (ingredients: ReadonlyArray<{ ingredient: { id: string } }>): string[] => [
	...new Set(ingredients.map(({ ingredient }) => ingredient.id)),
];

/** How many of the optional ingredients (those that are not required) a person has. */
export const countOptionalIngredientsAvailable = (
	allIngredientIds: readonly string[],
	requiredIngredientIds: readonly string[],
	availableIds: ReadonlySet<string>,
) => {
	const required = new Set(requiredIngredientIds);
	return allIngredientIds.filter((id) => !required.has(id) && availableIds.has(id)).length;
};
