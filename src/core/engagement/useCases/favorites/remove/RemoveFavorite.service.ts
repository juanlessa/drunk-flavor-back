import { IFavoritesRepository } from '@/core/engagement/repositories/IFavorites.repository';
import { RemoveFavoriteCommand } from './removeFavorite.dtos';

export class RemoveFavoriteService {
	constructor(private favoritesRepository: IFavoritesRepository) {}

	/** Removes the drink from the favorites of the actor. Idempotent: it is not an error if it was not one. */
	async execute({ drinkId, actor }: RemoveFavoriteCommand): Promise<void> {
		await this.favoritesRepository.remove({ drinkId, userId: actor.id });
	}
}
