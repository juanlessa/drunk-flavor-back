import { IDrink } from '@modules/drinks/entities/drink.entity';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import { getFileURL } from '@utils/getFileURL';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListDrinksService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}

	async execute(): Promise<IDrink[]> {
		const drinks = await this.drinksRepository.findAll();

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
