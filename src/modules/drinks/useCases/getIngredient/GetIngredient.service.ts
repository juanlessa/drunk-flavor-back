import { IGetIngredient } from '@modules/drinks/dtos/ingredient.dtos';
import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@shared/errors/error.lib';

class GetIngredientService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ id }: IGetIngredient): Promise<IIngredient> {
		const ingredient = await this.ingredientsRepository.findById(id);
		if (!ingredient) {
			throw new BadRequestError(INGREDIENT_ERRORS.not_found, { path: 'GetIngredient.service' });
		}

		return ingredient;
	}
}

export { GetIngredientService };
