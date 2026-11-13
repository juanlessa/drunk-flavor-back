import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ListIngredientsCommand } from './listIngredients.dtos';

export class ListIngredientsService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ query = {} }: ListIngredientsCommand) {
		const ingredients = await this.ingredientsRepository.findAll(query);

		return ingredients.map(omitAuthorship);
	}
}
