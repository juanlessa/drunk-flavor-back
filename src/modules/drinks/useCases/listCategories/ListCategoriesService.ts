import Category from '@modules/drinks/entities/Category';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListCategoriesService {
	constructor(
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}

	async execute(): Promise<Category[]> {
		const categories = await this.categoriesRepository.findAll();

		return categories;
	}
}

export { ListCategoriesService };
