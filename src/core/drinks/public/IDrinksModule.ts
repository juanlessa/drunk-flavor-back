import { Drink } from '@/core/drinks/entities/drink.entity';

export type RatingCountDelta = -1 | 0 | 1;

export type ApplyRatingDelta = {
	drinkId: string;
	countDelta: RatingCountDelta;
	sumDelta: number;
};

export type DrinkRatingSummary = {
	average: number;
	count: number;
};

export interface IDrinksModule {
	findDrinkById(drinkId: string): Promise<Drink | null>;
	applyRatingDelta(input: ApplyRatingDelta): Promise<DrinkRatingSummary>;
}
