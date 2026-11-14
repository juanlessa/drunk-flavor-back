import { resolveFavoritesRepository } from '@/core/engagement/infra/mongo/container';
import { ObjectId } from 'mongodb';

export const createFavoriteRecord = async (options?: { drinkId?: string; userId?: string }) => {
	const favorite = await resolveFavoritesRepository().add({
		drinkId: options?.drinkId ?? new ObjectId().toString(),
		userId: options?.userId ?? new ObjectId().toString(),
	});
	return { favorite, id: favorite.id };
};
