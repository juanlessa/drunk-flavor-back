import { IGetDrink } from '@modules/drinks/dtos/drink.dtos';
import { IDrink } from '@modules/drinks/entities/drink.entity';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import AppError from '@shared/errors/AppError';
import { getFileURL } from '@utils/getFileURL';
import { inject, injectable } from 'tsyringe';

@injectable()
class GetDrinkService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}

	async execute({ id }: IGetDrink): Promise<IDrink> {
		const drink = await this.drinksRepository.findById(id);
		if (!drink) {
			throw new AppError(DRINK_ERRORS.not_found);
		}

		if (drink.cover) {
			drink.cover = getFileURL(drink.cover);
		}
		if (drink.thumbnail) {
			drink.thumbnail = getFileURL(drink.thumbnail);
		}

		return drink;
	}
}

export { GetDrinkService };
