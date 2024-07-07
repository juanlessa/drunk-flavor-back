import { GetCategory } from '@/modules/drinks/dtos/category.dtos';
import { Category } from '@/modules/drinks/entities/category.entity';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { CATEGORY_MESSAGES } from '@/modules/drinks/constants/categories.constants';
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
