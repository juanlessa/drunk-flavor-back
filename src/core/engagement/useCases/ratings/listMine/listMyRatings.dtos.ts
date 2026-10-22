import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { ratingQuerySchema } from '@/core/engagement/schemas/rating.schemas';
import { EngagementActor } from '@/core/engagement/types/actor.types';
import { z } from 'zod/v4';

export type ListMyRatingsReqQuery = z.infer<typeof ratingQuerySchema>;

export type ListMyRatingsCommand = {
	query: RatingListQuery;
	actor: EngagementActor;
};
