import { IGetIngredient } from '@modules/drinks/dtos/ingredient.dtos';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class GetIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}

	async execute({ id }: IGetIngredient): Promise<IIngredient> {
		const ingredient = await this.ingredientsRepository.findById(id);
		if (!ingredient) {
			throw new AppError(INGREDIENT_ERRORS.not_found);
		}

		return ingredient;
	}
}

export { GetIngredientService };
