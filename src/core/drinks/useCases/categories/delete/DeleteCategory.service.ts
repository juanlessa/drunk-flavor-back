import { DeleteCategory } from '@/core/drinks/dtos/category.dtos';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { BadRequestError } from '@/shared/error/error.lib';

export class DeleteCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id }: DeleteCategory) {
		const categoryExists = await this.categoriesRepository.findById(id);
		if (!categoryExists) {
			throw new BadRequestError('apiResponses.categories.notExist', { path: 'DeleteCategory.service' });
		}

		await this.categoriesRepository.delete(id);
	}
}
