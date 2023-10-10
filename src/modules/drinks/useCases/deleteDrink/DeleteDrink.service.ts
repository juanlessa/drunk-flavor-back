import { IDeleteDrink } from '@modules/drinks/dtos/drink.dtos';
import { DRINK_ERRORS } from '@modules/drinks/errors/drink.errors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinks.repository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class DeleteDrinkService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}
	async execute({ id }: IDeleteDrink): Promise<void> {
		const drinkExists = await this.drinksRepository.findById(id);

		if (!drinkExists) {
			throw new AppError(DRINK_ERRORS.not_exist);
		}

		await this.drinksRepository.delete(id);
	}
}

export { DeleteDrinkService };
