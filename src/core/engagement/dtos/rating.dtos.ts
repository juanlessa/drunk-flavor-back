export type CreateRating = {
	drinkId: string;
	userId: string;
	value: number;
};

export type UpdateRating = {
	id: string;
	value: number;
};

export type RatingSummary = {
	average: number;
	count: number;
};

export type RatingSortField = 'createdAt' | 'updatedAt' | 'value' | 'id';

export type RatingListQuery = {
	page: number;
	limit: number;
	sort: Readonly<Partial<Record<RatingSortField, 1 | -1>>>;
};
