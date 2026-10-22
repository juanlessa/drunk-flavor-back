import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';
import { updateRatingBodySchema, updateRatingParamsSchema } from './updateRating.schema';

export type UpdateRatingReqBody = z.infer<typeof updateRatingBodySchema>;
export type UpdateRatingReqParam = z.infer<typeof updateRatingParamsSchema>;

export type UpdateRatingCommand = {
	id: string;
	value: number;
	actor: Actor;
};
