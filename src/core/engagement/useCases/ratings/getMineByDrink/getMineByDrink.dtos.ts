import { listRatingsByDrinkSchema } from '@/core/engagement/useCases/ratings/listByDrink/listRatingsByDrink.schema';
import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';

export type GetMineByDrinkReqParam = z.infer<typeof listRatingsByDrinkSchema>;

export type GetMineByDrinkCommand = {
	drink_id: string;
	actor: Actor;
};
