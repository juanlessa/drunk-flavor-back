import { DRINK_MESSAGES } from '@/core/drinks/constants/drinks.constants';
import { DeleteDrink } from '@/core/drinks/dtos/drink.dtos';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';

export class DeleteDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ id }: DeleteDrink) {
		const drinkExists = await this.drinksRepository.findById(id);
		if (!drinkExists) {
			throw new BadRequestError(DRINK_MESSAGES.notExist.message, { path: 'DeleteDrink.service' });
		}

		await this.drinksRepository.delete(id);

		if (drinkExists.cover) {
			await this.storageProvider.deleteFile(drinkExists.cover.name);
		}
		if (drinkExists.thumbnail) {
			await this.storageProvider.deleteFile(drinkExists.thumbnail.name);
		}
	}
}
