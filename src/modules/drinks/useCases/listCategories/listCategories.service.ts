import { ICategory } from '@modules/drinks/entities/category.entity';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListCategoriesService {
	constructor(
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}

	async execute(): Promise<ICategory[]> {
		const categories = await this.categoriesRepository.findAll();

		return categories;
	}
}

export { ListCategoriesService };
