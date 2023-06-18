import { IDrinkResponse } from '@modules/drinks/dtos/Drinks';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { getFileURL } from '@utils/getFileURL';
import { inject, injectable } from 'tsyringe';

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
