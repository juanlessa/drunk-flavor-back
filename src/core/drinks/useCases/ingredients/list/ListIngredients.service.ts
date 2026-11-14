import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ListIngredientsCommand } from './listIngredients.dtos';

export class ListIngredientsService {
	constructor(
		private ingredientsRepository: IIngredientsRepository,
		private drinksRepository: IDrinksRepository,
	) {}

	async execute({ query = {}, inUse = false }: ListIngredientsCommand) {
		if (!inUse) {
			const ingredients = await this.ingredientsRepository.findAll(query);
			return ingredients.map(omitAuthorship);
		}

		const idsInUse = await this.drinksRepository.findIngredientIdsInUse();
		if (idsInUse.length === 0) return [];

		const ingredients = await this.ingredientsRepository.findAll(query, idsInUse);
		return ingredients.map(omitAuthorship);
	}
}
