import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { ListCategoriesDTO } from './listCategories.dtos';

export class ListCategoriesService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ query }: ListCategoriesDTO) {
		const categories = await this.categoriesRepository.findAll(query);

		return categories;
	}
}
