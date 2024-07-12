import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';

export class ListIngredientsService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute() {
		const ingredients = await this.ingredientsRepository.findAll();

		return ingredients;
	}
}
