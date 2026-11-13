import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';
import { addFavoriteSchema } from './addFavorite.schema';

export type AddFavoriteReqParam = z.infer<typeof addFavoriteSchema>;

export type AddFavoriteCommand = {
	drinkId: string;
	actor: Actor;
};
