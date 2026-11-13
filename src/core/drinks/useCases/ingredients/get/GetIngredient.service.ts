import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { GetIngredientCommand } from './getIngredient.dtos';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { NotFoundError } from '@/shared/error/error.lib';

export class GetIngredientService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ id }: GetIngredientCommand) {
		const ingredient = await this.ingredientsRepository.findById(id);
		if (!ingredient) {
			throw new NotFoundError('apiResponses.ingredients.notFound', { path: 'GetIngredient.service' });
		}

		return omitAuthorship(ingredient);
	}
}
