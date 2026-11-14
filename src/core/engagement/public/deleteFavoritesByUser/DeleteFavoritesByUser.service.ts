import { IFavoritesRepository } from '@/core/engagement/repositories/IFavorites.repository';
import { DeleteFavoritesByUser } from './deleteFavoritesByUser.dtos';

export class DeleteFavoritesByUserService {
	constructor(private favoritesRepository: IFavoritesRepository) {}

	/** Deletes every favorite of the user and returns how many were removed. */
	execute({ userId }: DeleteFavoritesByUser): Promise<number> {
		return this.favoritesRepository.deleteByUser(userId);
	}
}
