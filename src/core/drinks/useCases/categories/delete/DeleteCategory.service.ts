import { DeleteCategory } from '@/core/drinks/dtos/category.dtos';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { CATEGORY_MESSAGES } from '@/core/drinks/constants/categories.constants';
import { BadRequestError } from '@/shared/error/error.lib';

export class DeleteCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id }: DeleteCategory) {
		const categoryExists = await this.categoriesRepository.findById(id);
		if (!categoryExists) {
			throw new BadRequestError(CATEGORY_MESSAGES.notExist.message, { path: 'DeleteCategory.service' });
		}

		await this.categoriesRepository.delete(id);
	}
}
