import { GetDrink } from '@/core/drinks/dtos/drink.dtos';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';

/**
 * Gets a drink for the people who contribute to the catalog. Unlike the public read, it shows who created and last
 * edited it. It is the single-record counterpart of the listing with authorship, so every drink is visible to them.
 */
export class GetDrinkWithAuthorshipService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ id }: GetDrink) {
		const drink = await this.drinksRepository.findById(id);
		if (!drink) {
			throw new NotFoundError('apiResponses.drinks.notFound', { path: 'GetDrinkWithAuthorship.service' });
		}
		if (drink.cover) {
			drink.cover.url = this.storageProvider.getFileURL(drink.cover.name);
		}
		if (drink.thumbnail) {
			drink.thumbnail.url = this.storageProvider.getFileURL(drink.thumbnail.name);
		}
		return drink;
	}
}
