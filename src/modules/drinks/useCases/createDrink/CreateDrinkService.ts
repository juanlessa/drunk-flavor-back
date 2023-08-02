import { ICreateDrink } from '@modules/drinks/dtos/Drinks';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { createDrinkSchema } from '@modules/drinks/validations/drinks';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class CreateDrinkService {
	constructor(
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository,
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}

	async execute(data: ICreateDrink): Promise<void> {
		const result = createDrinkSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<ICreateDrink>;
			throw new AppError(error.issues[0].message);
		}

		const { name, method, ingredients } = result.data;

		const drinkALreadyExists = await this.drinksRepository.findByNameWithIngredientsDetails(name);
		if (drinkALreadyExists) {
			throw new AppError(DRINK_ERRORS.already_exist);
		}

		const ingredientsExists = await this.ingredientsRepository.findByIdList(ingredients.map((i) => i.ingredientId));
		if (ingredientsExists.length !== ingredients.length) {
			throw new AppError(DRINK_ERRORS.some_ingredients_not_exist);
		}

		const ingredientsFormat = ingredients.map((ing) => {
			return {
				ingredientId: ing.ingredientId,
				quantity: ing.quantity
			};
		});

		await this.drinksRepository.create({ name, method, ingredients: ingredientsFormat });
	}
}

export { CreateDrinkService };
