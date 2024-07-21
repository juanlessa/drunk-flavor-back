import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ListIngredientsDTO } from './listIngredients.dtos';

export class ListIngredientsService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ query = {} }: ListIngredientsDTO) {
		const ingredients = await this.ingredientsRepository.findAll(query);

		return ingredients;
	}
}
