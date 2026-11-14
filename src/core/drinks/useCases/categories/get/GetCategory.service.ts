import { omitAuthorship } from '@/shared/helpers/authorship.helpers';
import { GetCategoryCommand } from './getCategory.dtos';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { NotFoundError } from '@/shared/error/error.lib';

export class GetCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id }: GetCategoryCommand) {
		const category = await this.categoriesRepository.findById(id);
		if (!category) {
			throw new NotFoundError('apiResponses.categories.notFound', { path: 'GetCategory.service' });
		}

		return omitAuthorship(category);
	}
}
