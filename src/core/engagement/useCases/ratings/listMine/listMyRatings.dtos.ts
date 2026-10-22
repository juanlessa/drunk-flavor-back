import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { ratingQuerySchema } from '@/core/engagement/schemas/rating.schemas';
import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';

export type ListMyRatingsReqQuery = z.infer<typeof ratingQuerySchema>;

export type ListMyRatingsCommand = {
	query: RatingListQuery;
	actor: Actor;
};
