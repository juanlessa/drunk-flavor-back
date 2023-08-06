import { IUpdateDrink, IUpdateDrinkCover } from '@modules/drinks/dtos/Drinks';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { updateDrinkCoverSchema } from '@modules/drinks/validations/drinks';
import AppError from '@shared/errors/AppError';
import { deleteFile } from '@utils/deleteFile';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class UpdateDrinkCoverService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}
	async execute(data: IUpdateDrinkCover): Promise<void> {
		const result = updateDrinkCoverSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IUpdateDrinkCover>;
			throw new AppError(error.issues[0].message);
		}
		const { drinkId, coverFile } = result.data;

		const drink = await this.drinksRepository.findByIdWithIngredientsDetails(drinkId);
		if (!drink) {
			throw new AppError(DRINK_ERRORS.not_exist);
		}

		if (drink.cover) {
			await deleteFile(drink.cover);
		}
		drink.cover = coverFile;

		const updateDrink: IUpdateDrink = {
			id: drinkId,
			name: drink.name,
			method: drink.method,
			ingredients: drink.ingredients.map((ing) => ({ ingredientId: ing.ingredient.id, quantity: ing.quantity })),
			cover: drink.cover,
			thumbnail: drink.thumbnail
		};

		await this.drinksRepository.update(updateDrink);
	}
}

export { UpdateDrinkCoverService };
