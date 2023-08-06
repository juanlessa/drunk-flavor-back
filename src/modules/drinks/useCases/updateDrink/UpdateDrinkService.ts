import { IUpdateDrink } from '@modules/drinks/dtos/Drinks';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { updateDrinkSchema } from '@modules/drinks/validations/drinks';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class UpdateDrinkService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository,
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}
	async execute(data: IUpdateDrink): Promise<void> {
		const result = updateDrinkSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IUpdateDrink>;
			throw new AppError(error.issues[0].message);
		}
		const { id, name, method, ingredients } = result.data;

		const drink = await this.drinksRepository.findById(id);
		if (!drink) {
			throw new AppError(DRINK_ERRORS.not_exist);
		}

		const drinkNameALreadyExists = await this.drinksRepository.findByName(name);
		if (drinkNameALreadyExists && drinkNameALreadyExists.id !== drink.id) {
			throw new AppError(DRINK_ERRORS.name_already_exit);
		}

		const ingredientsExists = await this.ingredientsRepository.findByIdList(ingredients.map((i) => i.ingredientId));
		if (ingredientsExists.length !== ingredients.length) {
			throw new AppError(DRINK_ERRORS.some_ingredients_not_exist);
		}

		const updateDrink: IUpdateDrink = {
			id,
			name,
			method,
			ingredients: ingredients.map((ing) => ({ ingredientId: ing.ingredientId, quantity: ing.quantity })),
			cover: drink.cover,
			thumbnail: drink.thumbnail
		};
		await this.drinksRepository.update(updateDrink);
	}
}

export { UpdateDrinkService };
