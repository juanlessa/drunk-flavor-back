import { IDrinksModule } from '@/core/drinks/public';
import { MAX_FAVORITES_PER_USER } from '@/core/engagement/constants/favorite.constants';
import { IFavoritesRepository } from '@/core/engagement/repositories/IFavorites.repository';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';
import { AddFavoriteCommand } from './addFavorite.dtos';

export class AddFavoriteService {
	constructor(
		private favoritesRepository: IFavoritesRepository,
		private drinksModule: IDrinksModule,
	) {}

	/**
	 * Saves the drink as a favorite of the actor. Idempotent: repeating it changes nothing, even when the actor
	 * is at the limit. A new favorite past `MAX_FAVORITES_PER_USER` is rejected with a conflict.
	 */
	async execute({ drinkId, actor }: AddFavoriteCommand): Promise<void> {
		if (!(await this.drinksModule.findDrinkById({ drinkId }))) {
			throw new NotFoundError('apiResponses.drinks.notFound', { path: 'AddFavorite.service' });
		}
		if (await this.favoritesRepository.findByDrinkAndUser(drinkId, actor.id)) return;
		if ((await this.favoritesRepository.countByUser(actor.id)) >= MAX_FAVORITES_PER_USER) {
			throw this.limitReached();
		}
		await this.favoritesRepository.add({ drinkId, userId: actor.id });
		// Concurrent adds can each pass the check above. The count after the insert settles it: whoever finds the
		// limit exceeded undoes its own favorite, so the limit holds (at the edge, both racers may be rejected).
		if ((await this.favoritesRepository.countByUser(actor.id)) > MAX_FAVORITES_PER_USER) {
			await this.favoritesRepository.remove({ drinkId, userId: actor.id });
			throw this.limitReached();
		}
	}

	private limitReached(): ConflictError {
		return new ConflictError('apiResponses.favorites.limitReached', {
			path: 'AddFavorite.service',
			cause: `The user already has ${MAX_FAVORITES_PER_USER} favorites`,
		});
	}
}
