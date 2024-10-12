import { GetCategory } from '@/core/drinks/dtos/category.dtos';
import { Category } from '@/core/drinks/entities/category.entity';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { BadRequestError } from '@/shared/error/error.lib';

export class GetCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id }: GetCategory): Promise<Category> {
		const category = await this.categoriesRepository.findById(id);
		if (!category) {
			throw new BadRequestError('apiResponses.categories.notFound', { path: 'GetCategory.service' });
		}

		return category;
	}
}
