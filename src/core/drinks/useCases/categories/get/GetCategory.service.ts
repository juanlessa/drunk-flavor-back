import { GetCategory } from '@/core/drinks/dtos/category.dtos';
import { Category } from '@/core/drinks/entities/category.entity';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { CATEGORY_MESSAGES } from '@/core/drinks/constants/categories.constants';
import { BadRequestError } from '@/shared/error/error.lib';

export class GetCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id }: GetCategory): Promise<Category> {
		const category = await this.categoriesRepository.findById(id);
		if (!category) {
			throw new BadRequestError(CATEGORY_MESSAGES.notFound.message, { path: 'GetCategory.service' });
		}

		return category;
	}
}
