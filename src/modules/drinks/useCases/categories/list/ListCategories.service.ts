import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';

export class ListCategoriesService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute() {
		const categories = await this.categoriesRepository.findAll();

		return categories;
	}
}
