import { DeleteDrink } from '@/core/drinks/dtos/drink.dtos';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';

export class DeleteDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ id }: DeleteDrink) {
		const drinkExists = await this.drinksRepository.findById(id);
		if (!drinkExists) {
			throw new NotFoundError('apiResponses.drinks.notFound', { path: 'DeleteDrink.service' });
		}

		await this.drinksRepository.delete(id);
		// TODO: Enqueue engagement cleanup for comments and ratings by drink id.

		if (drinkExists.cover) {
			await this.storageProvider.deleteFile(drinkExists.cover.name);
		}
		if (drinkExists.thumbnail) {
			await this.storageProvider.deleteFile(drinkExists.thumbnail.name);
		}
	}
}
