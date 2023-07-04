import { IGetIngredient } from '@modules/drinks/dtos/ingredients';
import Ingredient from '@modules/drinks/entities/Ingredient';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { getIngredientSchema } from '@modules/drinks/validations/ingredients';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class GetIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}

	async execute(data: IGetIngredient): Promise<Ingredient> {
		const result = getIngredientSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IGetIngredient>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const ingredient = await this.ingredientsRepository.findById(id);

		if (!ingredient) {
			throw new AppError(INGREDIENT_ERRORS.not_found);
		}

		return ingredient;
	}
}

export { GetIngredientService };
