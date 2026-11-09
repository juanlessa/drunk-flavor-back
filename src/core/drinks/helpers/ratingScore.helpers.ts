import { RATING_PRIOR_MEAN, RATING_PRIOR_WEIGHT } from '@/core/drinks/constants/drink.constants';

/**
 * The score drinks are ranked by: their average pulled toward the prior by as many ratings as the prior weighs,
 * `(sum + weight × mean) / (count + weight)`. With no rating it is the prior mean; with many, it nears the average.
 */
export const getRatingScore = (ratingsSum: number, ratingsCount: number): number =>
	(ratingsSum + RATING_PRIOR_WEIGHT * RATING_PRIOR_MEAN) / (ratingsCount + RATING_PRIOR_WEIGHT);
