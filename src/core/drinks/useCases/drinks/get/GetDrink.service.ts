import { DRINK_MESSAGES } from '@/core/drinks/constants/drinks.constants';
import { GetDrink } from '@/core/drinks/dtos/drink.dtos';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';

export class GetDrinkService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ id }: GetDrink) {
		const drink = await this.drinksRepository.findById(id);

		if (!drink) {
			throw new BadRequestError(DRINK_MESSAGES.notFound.message, { path: 'GetDrink.service' });
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
