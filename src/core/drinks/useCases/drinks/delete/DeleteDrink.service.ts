import { assertCanChangeDrink } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { DeleteDrinkDTO } from './deleteDrink.dtos';

export class DeleteDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ id, actor }: DeleteDrinkDTO) {
		const drinkExists = await this.drinksRepository.findById(id);
		if (!drinkExists) {
			throw new NotFoundError('apiResponses.drinks.notFound', { path: 'DeleteDrink.service' });
		}
		assertCanChangeDrink('delete', drinkExists, actor, 'DeleteDrink.service.forbidden');

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
