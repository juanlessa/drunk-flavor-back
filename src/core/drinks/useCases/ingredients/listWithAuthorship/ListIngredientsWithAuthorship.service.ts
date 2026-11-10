import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { ListIngredientsWithAuthorshipDTO } from './listIngredientsWithAuthorship.dtos';

/**
 * Lists the ingredients for the people who contribute to the catalog: the ones the actor created come first, then the others,
 * each group in the order of the query. Unlike the public listing, it shows who created and last edited each one.
 */
export class ListIngredientsWithAuthorshipService {
	constructor(private ingredientsRepository: IIngredientsRepository) {}

	async execute({ query = {}, actor }: ListIngredientsWithAuthorshipDTO) {
		return this.ingredientsRepository.findAllOwnedFirst(query, actor.id);
	}
}
