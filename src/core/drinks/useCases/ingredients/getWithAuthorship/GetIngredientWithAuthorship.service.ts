import { GetIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { NotFoundError } from '@/shared/error/error.lib';

/**
 * Gets a ingredient for the people who contribute to the catalog. Unlike the public read, it shows who created and last
 * edited it. It is the single-record counterpart of the listing with authorship, so every ingredient is visible to them.
 */
export class GetIngredientWithAuthorshipService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ id }: GetIngredient) {
		const ingredient = await this.ingredientsRepository.findById(id);
		if (!ingredient) {
			throw new NotFoundError('apiResponses.ingredients.notFound', {
				path: 'GetIngredientWithAuthorship.service',
			});
		}
		return ingredient;
	}
}
