import { IDeleteIngredient } from '@modules/drinks/dtos/ingredients';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';
import { IDrinksRepository } from '@modules/drinks/repositories/IDrinksRepository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { deleteIngredientSchema } from '@modules/drinks/validations/ingredients';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class DeleteIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository,
		@inject('DrinksRepository')
		private drinksRepository: IDrinksRepository
	) {}
	async execute(data: IDeleteIngredient): Promise<void> {
		const result = deleteIngredientSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IDeleteIngredient>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const ingredientExists = await this.ingredientsRepository.findById(id);

		if (!ingredientExists) {
			throw new AppError(INGREDIENT_ERRORS.not_exist);
		}

		await this.ingredientsRepository.delete(id);
		await this.drinksRepository.removeDeletedIngredient(id);
	}
}

export { DeleteIngredientService };
