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

/**
 * The prior of the rating score (a Bayesian average, as in the IMDb Top 250): every drink is ranked as if it also
 * had `RATING_PRIOR_WEIGHT` ratings of `RATING_PRIOR_MEAN`. A drink with few ratings stays near the prior, so a
 * single 5 does not outrank many 4s, and the score moves to the real average as ratings come in.
 */
export const RATING_PRIOR_MEAN = 3;
export const RATING_PRIOR_WEIGHT = 5;
