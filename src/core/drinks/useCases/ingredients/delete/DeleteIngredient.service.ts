import { assertCanChangeIngredient } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { DeleteIngredientDTO } from './deleteIngredient.dtos';

export class DeleteIngredientService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}
	async execute({ id, actor }: DeleteIngredientDTO) {
		const ingredient = await this.ingredientsRepository.findById(id);
		if (!ingredient) {
			throw new NotFoundError('apiResponses.ingredients.notFound', { path: 'DeleteIngredient.service' });
		}
		assertCanChangeIngredient('delete', ingredient, actor, 'DeleteIngredient.service.forbidden');
		await this.ingredientsRepository.delete(id);
	}
}
