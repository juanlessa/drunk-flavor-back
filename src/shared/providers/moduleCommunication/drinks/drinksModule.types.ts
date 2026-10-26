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
