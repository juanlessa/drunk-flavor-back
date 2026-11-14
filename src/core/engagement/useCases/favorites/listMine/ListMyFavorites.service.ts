import { IDrinksModule } from '@/core/drinks/public';
import { FavoriteWithDrink, FavoriteWithDrinkPage } from '@/core/engagement/dtos/favorite.dtos';
import { IFavoritesRepository } from '@/core/engagement/repositories/IFavorites.repository';
import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { encodeCursor } from '@/shared/helpers/cursor.helpers';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { ListMyFavoritesCommand } from './listMyFavorites.dtos';

export class ListMyFavoritesService {
	constructor(
		private favoritesRepository: IFavoritesRepository,
		private drinksModule: IDrinksModule,
		private storageProvider: IStorageProvider,
	) {}

	/**
	 * One page of the actor's favorites, newest first, each with its drink. A favorite whose drink is gone
	 * (its cleanup is still pending) is left out, so a page may hold fewer items than the limit while
	 * `nextCursor` still points to the following page.
	 */
	async execute({ query, actor }: ListMyFavoritesCommand): Promise<FavoriteWithDrinkPage> {
		const page = await this.favoritesRepository.findPageByUser(actor.id, query);
		const nextCursor = page.nextCursor ? encodeCursor(page.nextCursor) : null;
		if (page.items.length === 0) return { items: [], nextCursor };

		const drinks = await this.drinksModule.findDrinksByIds({ drinkIds: page.items.map((item) => item.drinkId) });
		const drinksById = new Map(drinks.map((drink) => [drink.id, drink]));

		const items = page.items.flatMap((favorite): FavoriteWithDrink[] => {
			const drink = drinksById.get(favorite.drinkId);
			if (!drink) return [];
			const { cover, thumbnail } = drink;
			return [
				{
					...favorite,
					drink: omitAuthorship({
						...drink,
						...(cover && { cover: { ...cover, url: this.storageProvider.getFileURL(cover.name) } }),
						...(thumbnail && {
							thumbnail: { ...thumbnail, url: this.storageProvider.getFileURL(thumbnail.name) },
						}),
					}),
				},
			];
		});
		return { items, nextCursor };
	}
}
