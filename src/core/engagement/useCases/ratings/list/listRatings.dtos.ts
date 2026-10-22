import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { ratingQuerySchema } from '@/core/engagement/schemas/rating.schemas';
import { z } from 'zod/v4';

export type ListRatingsReqQuery = z.infer<typeof ratingQuerySchema>;

export type ListRatingsCommand = {
	query: RatingListQuery;
};
