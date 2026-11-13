import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { ListCategoriesCommand } from './listCategories.dtos';

export class ListCategoriesService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ query = {} }: ListCategoriesCommand) {
		const categories = await this.categoriesRepository.findAll(query);

		return categories.map(omitAuthorship);
	}
}
