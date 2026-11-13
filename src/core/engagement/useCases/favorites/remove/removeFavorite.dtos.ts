import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';
import { removeFavoriteSchema } from './removeFavorite.schema';

export type RemoveFavoriteReqParam = z.infer<typeof removeFavoriteSchema>;

export type RemoveFavoriteCommand = {
	drinkId: string;
	actor: Actor;
};
