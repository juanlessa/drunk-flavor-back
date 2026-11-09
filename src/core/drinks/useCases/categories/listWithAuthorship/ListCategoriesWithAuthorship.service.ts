import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { ListCategoriesWithAuthorshipDTO } from './listCategoriesWithAuthorship.dtos';

/**
 * Lists the categories for the people who contribute to the catalog: the ones the actor created come first, then the others,
 * each group in the order of the query. Unlike the public listing, it shows who created and last edited each one.
 */
export class ListCategoriesWithAuthorshipService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ query = {}, actor }: ListCategoriesWithAuthorshipDTO) {
		return this.categoriesRepository.findAllOwnedFirst(query, actor.id);
	}
}
