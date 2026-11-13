import { FavoriteDrinkIds } from '@/core/engagement/dtos/favorite.dtos';
import { IFavoritesRepository } from '@/core/engagement/repositories/IFavorites.repository';
import { ListMyFavoriteDrinkIdsCommand } from './listMyFavoriteDrinkIds.dtos';

export class ListMyFavoriteDrinkIdsService {
	constructor(private favoritesRepository: IFavoritesRepository) {}

	/** The ids of every drink the actor saved, newest first. Meant for marking drinks in a list. */
	async execute({ actor }: ListMyFavoriteDrinkIdsCommand): Promise<FavoriteDrinkIds> {
		return { drinkIds: await this.favoritesRepository.findDrinkIdsByUser(actor.id) };
	}
}
