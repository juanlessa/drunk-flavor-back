import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { GetCategory } from '@/core/drinks/dtos/category.dtos';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { NotFoundError } from '@/shared/error/error.lib';

export class GetCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id }: GetCategory) {
		const category = await this.categoriesRepository.findById(id);
		if (!category) {
			throw new NotFoundError('apiResponses.categories.notFound', { path: 'GetCategory.service' });
		}

		return omitAuthorship(category);
	}
}
