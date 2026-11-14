import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { ListDrinksCommand } from './listDrinks.dtos';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';

export class ListDrinksService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ query = {} }: ListDrinksCommand) {
		const drinks = await this.drinksRepository.findAll(query);

		const drinksWithImagesURL = drinks.map((d) => {
			if (d.cover) {
				d.cover.url = this.storageProvider.getFileURL(d.cover.name);
			}
			if (d.thumbnail) {
				d.thumbnail.url = this.storageProvider.getFileURL(d.thumbnail.name);
			}
			return omitAuthorship(d);
		});

		return drinksWithImagesURL;
	}
}
