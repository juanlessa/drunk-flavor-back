import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';
import { deleteRatingSchema } from './deleteRating.schema';

export type DeleteRatingReqParam = z.infer<typeof deleteRatingSchema>;

export type DeleteRatingCommand = {
	id: string;
	actor: Actor;
};
