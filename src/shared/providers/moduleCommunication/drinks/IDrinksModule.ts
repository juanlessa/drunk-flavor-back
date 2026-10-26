import { ApplyRatingDelta, DrinkRatingSummary } from './drinksModule.types';

export interface IDrinksModule {
	applyRatingDelta(input: ApplyRatingDelta): Promise<DrinkRatingSummary>;
}
