import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { ratingQuerySchema } from '@/core/engagement/schemas/rating.schemas';
import { z } from 'zod/v4';
import { listRatingsByDrinkSchema } from './listRatingsByDrink.schema';

export type ListRatingsByDrinkReqParam = z.infer<typeof listRatingsByDrinkSchema>;
export type ListRatingsByDrinkReqQuery = z.infer<typeof ratingQuerySchema>;

export type ListRatingsByDrinkCommand = {
	drinkId: string;
	query: RatingListQuery;
};
