export type CreateRating = {
	drink_id: string;
	user_id: string;
	value: number;
};

export type UpdateRating = {
	id: string;
	value: number;
};

export type RatingSortField = 'created_at' | 'updated_at' | 'value' | '_id';

export type RatingListQuery = {
	page: number;
	limit: number;
	sort: Readonly<Partial<Record<RatingSortField, 1 | -1>>>;
};
