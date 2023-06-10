import { inject, injectable } from 'tsyringe';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { IDrinkResponse } from '@modules/drinks/dtos/DrinksDTO';
import { getFileURL } from '@utils/getFileURL';

@injectable()
class ListDrinksService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}

	async execute(): Promise<IDrinkResponse[]> {
		const drinks = await this.drinksRepository.findAllWithIngredientsDetails();

		const drinksWithImagesURL = drinks.map((d) => {
			if (d.cover) {
				d.cover = getFileURL(d.cover);
			}
			if (d.thumbnail) {
				d.thumbnail = getFileURL(d.thumbnail);
			}
			return d;
		});

		return drinksWithImagesURL;
	}
}

export { ListDrinksService };
