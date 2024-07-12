import { INGREDIENT_MESSAGES } from '@/modules/drinks/constants/ingredients.constants';
import { GetIngredient } from '@/modules/drinks/dtos/ingredient.dtos';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';

export class GetIngredientService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ id }: GetIngredient) {
		const ingredient = await this.ingredientsRepository.findById(id);
		if (!ingredient) {
			throw new BadRequestError(INGREDIENT_MESSAGES.notFound.message, { path: 'GetIngredient.service' });
		}

		return ingredient;
	}
}
