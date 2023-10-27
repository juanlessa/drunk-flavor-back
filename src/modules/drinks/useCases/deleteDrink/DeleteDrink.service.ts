import { IDeleteDrink } from '@modules/drinks/dtos/drink.dtos';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@shared/container/providers/storage/IStorage.provider';
import AppError from '@shared/errors/AppError';

class DeleteDrinkService {
	constructor(private drinksRepository: IDrinksRepository, private storageProvider: IStorageProvider) {}

	async execute({ id }: IDeleteDrink): Promise<void> {
		const drinkExists = await this.drinksRepository.findById(id);

		if (!drinkExists) {
			throw new AppError(DRINK_ERRORS.not_exist);
		}

		const deletedDrink = await this.drinksRepository.delete(id);
		if (deletedDrink.cover) {
			await this.storageProvider.deleteFile(deletedDrink.cover);
		}
		if (deletedDrink.thumbnail) {
			await this.storageProvider.deleteFile(deletedDrink.thumbnail);
		}
	}
}

export { DeleteDrinkService };
