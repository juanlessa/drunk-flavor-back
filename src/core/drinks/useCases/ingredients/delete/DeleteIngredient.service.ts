import { INGREDIENT_MESSAGES } from '@/core/drinks/constants/ingredients.constants';
import { DeleteIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';

export class DeleteIngredientService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ id }: DeleteIngredient) {
		const ingredientExists = await this.ingredientsRepository.findById(id);
		if (!ingredientExists) {
			throw new BadRequestError(INGREDIENT_MESSAGES.notExist.message, { path: 'DeleteIngredient.service' });
		}

		await this.ingredientsRepository.delete(id);
	}
}