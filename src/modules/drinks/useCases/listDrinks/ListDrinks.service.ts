import { IDrink } from '@modules/drinks/entities/drink.entity';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@shared/container/providers/storage/IStorage.provider';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListDrinksService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository,
		@inject('StorageProvider')
		private storageProvider: IStorageProvider
	) {}

	async execute(): Promise<IDrink[]> {
		const drinks = await this.drinksRepository.findAll();

		const drinksWithImagesURL = drinks.map((d) => {
			if (d.cover) {
				d.cover = this.storageProvider.getFileURL(d.cover);
			}
			if (d.thumbnail) {
				d.thumbnail = this.storageProvider.getFileURL(d.thumbnail);
			}
			return d;
		});

		return drinksWithImagesURL;
	}
}

export { ListDrinksService };
