import { ICategory } from '@modules/drinks/entities/category.entity';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';

class ListCategoriesService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute(): Promise<ICategory[]> {
		const categories = await this.categoriesRepository.findAll();

		return categories;
	}
}

export { ListCategoriesService };
