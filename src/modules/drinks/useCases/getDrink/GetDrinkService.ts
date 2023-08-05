import { IGetDrink } from '@modules/drinks/dtos/Drinks';
import Drink from '@modules/drinks/entities/Drink';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { getDrinkSchema } from '@modules/drinks/validations/drinks';
import AppError from '@shared/errors/AppError';
import { getFileURL } from '@utils/getFileURL';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class GetDrinkService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}

	async execute(data: IGetDrink): Promise<Drink> {
		const result = getDrinkSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IGetDrink>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const drink = await this.drinksRepository.findByIdWithIngredientsDetails(id);
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
