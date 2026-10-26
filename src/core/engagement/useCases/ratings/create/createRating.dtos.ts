import { DrinkRatingSummary } from '@/shared/providers/moduleCommunication/drinks';
import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';
import { createRatingSchema } from './createRating.schema';

export type CreateRatingReqBody = z.infer<typeof createRatingSchema>;

export type CreateRatingCommand = {
	drink_id: string;
	value: number;
	actor: Actor;
};

export type CreateRatingResult = {
	id: string;
	summary: DrinkRatingSummary;
};
