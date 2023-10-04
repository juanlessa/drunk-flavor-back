import { IIngredient } from '@modules/drinks/entities/ingredient.entity';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListIngredientsService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}

	async execute(): Promise<IIngredient[]> {
		const ingredients = await this.ingredientsRepository.findAll();

		return ingredients;
	}
}

export { ListIngredientsService };
