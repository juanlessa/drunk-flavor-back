import Ingredient from '@modules/drinks/entities/Ingredient';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListIngredientsService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}

	async execute(): Promise<Ingredient[]> {
		const ingredients = await this.ingredientsRepository.findAll();

		return ingredients;
	}
}

export { ListIngredientsService };
