import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { ListDrinksWithAuthorshipCommand } from './listDrinksWithAuthorship.dtos';

/**
 * Lists the drinks for the people who contribute to the catalog: the ones the actor created come first, then the others,
 * each group in the order of the query. Unlike the public listing, it shows who created and last edited each one.
 */
export class ListDrinksWithAuthorshipService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ query = {}, actor }: ListDrinksWithAuthorshipCommand) {
		const drinks = await this.drinksRepository.findAllOwnedFirst(query, actor.id);
		return drinks.map((drink) => {
			if (drink.cover) {
				drink.cover.url = this.storageProvider.getFileURL(drink.cover.name);
			}
			if (drink.thumbnail) {
				drink.thumbnail.url = this.storageProvider.getFileURL(drink.thumbnail.name);
			}
			return drink;
		});
	}
}
