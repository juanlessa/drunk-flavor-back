import { IUpdateDrink } from '@modules/drinks/dtos/Drinks';
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
			throw new AppError('Drink does not exist');
		}

		const drinkNameALreadyExists = await this.drinksRepository.findByName(name);
		if (drinkNameALreadyExists && drinkNameALreadyExists.id !== drink.id) {
			throw new AppError('Drink name already exists');
		}

		const ingredientsExists = await this.ingredientsRepository.findByIdList(ingredients.map((i) => i.ingredientId));
		if (ingredientsExists.length !== ingredients.length) {
			throw new AppError("Some ingredients don't exist");
		}

		drink.name = name;
		drink.method = method;
		drink.ingredients = ingredients.map((ing) => ({ ingredientId: ing.ingredientId, quantity: ing.quantity }));

		await this.drinksRepository.update(drink);
	}
}

export { UpdateDrinkService };
