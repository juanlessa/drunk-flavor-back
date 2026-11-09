import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { ListDrinksDTO } from './listDrinks.dtos';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';

export class ListDrinksService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ query = {} }: ListDrinksDTO) {
		const drinks = await this.drinksRepository.findAll(query);

		const drinksWithImagesURL = drinks.map((d) => {
			if (d.cover) {
				d.cover.url = this.storageProvider.getFileURL(d.cover.name);
			}
			if (d.thumbnail) {
				d.thumbnail.url = this.storageProvider.getFileURL(d.thumbnail.name);
			}
			return d;
		});

		return drinksWithImagesURL;
	}
}
