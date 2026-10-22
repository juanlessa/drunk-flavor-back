import { EngagementActor } from '@/core/engagement/types/actor.types';
import { z } from 'zod/v4';
import { createRatingSchema } from './createRating.schema';

export type CreateRatingReqBody = z.infer<typeof createRatingSchema>;

export type CreateRatingCommand = {
	drink_id: string;
	value: number;
	actor: EngagementActor;
};
