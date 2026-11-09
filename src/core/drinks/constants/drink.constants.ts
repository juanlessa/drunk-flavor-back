export const DrinkIngredientQualifiers = {
	topUp: 'top_up',
	toTaste: 'to_taste',
	asNeeded: 'as_needed',
} as const;

export const DrinkIngredientAmountTypes = {
	exact: 'exact',
	qualitative: 'qualitative',
	none: 'none',
} as const;

/**
 * How many required ingredients of a drink may be missing from the ones a person has: none, up to one, up to two,
 * or any number (`any`), as long as the drink uses at least one of the ingredients listed.
 */
export const DrinkMatchMaxMissing = [0, 1, 2, 'any'] as const;
/** The most ingredients a person can list in one search. */
export const MAX_DRINK_MATCH_INGREDIENTS = 50;
