import { FavoriteListQuery } from '@/core/engagement/dtos/favorite.dtos';
import { favoriteQuerySchema } from '@/core/engagement/schemas/favorite.schemas';
import { Actor } from '@/shared/accessControl/actor.types';
import { z } from 'zod/v4';

export type ListMyFavoritesReqQuery = z.infer<typeof favoriteQuerySchema>;

export type ListMyFavoritesCommand = {
	query: FavoriteListQuery;
	actor: Actor;
};
