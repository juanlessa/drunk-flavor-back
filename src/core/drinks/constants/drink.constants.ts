/**
 * - `ingredient`: a measured or listed component of the recipe.
 * - `garnish`: a finishing touch (e.g. a lime wedge, a mint sprig).
 *
 * The role belongs to the usage in a drink, not to the ingredient itself: the same
 * ingredient can be an ingredient in one drink and a garnish in another.
 */
export const DrinkIngredientRoles = {
	ingredient: 'ingredient',
	garnish: 'garnish',
} as const;

/**
 * How a qualitative amount is expressed when there is no exact figure:
 * - `top_up`: fill the glass (ginger beer, tonic water).
 * - `to_taste`: the preparer decides (salt, syrup).
 * - `as_needed`: as much as required.
 */
export const DrinkIngredientQualifiers = {
	topUp: 'top_up',
	toTaste: 'to_taste',
	asNeeded: 'as_needed',
} as const;

/**
 * - `exact`: a precise quantity in a unit (e.g. 50 ml).
 * - `qualitative`: a qualifier with an optional approximate quantity/unit hint (e.g. top up, ≈ 120 ml).
 * - `none`: no amount applies (e.g. ginger foam, a garnish).
 */
export const DrinkIngredientAmountTypes = {
	exact: 'exact',
	qualitative: 'qualitative',
	none: 'none',
} as const;
