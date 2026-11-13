import { GetCategoryWithAuthorshipCommand } from './getCategoryWithAuthorship.dtos';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { NotFoundError } from '@/shared/error/error.lib';

/**
 * Gets a category for the people who contribute to the catalog. Unlike the public read, it shows who created and last
 * edited it. It is the single-record counterpart of the listing with authorship, so every category is visible to them.
 */
export class GetCategoryWithAuthorshipService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id }: GetCategoryWithAuthorshipCommand) {
		const category = await this.categoriesRepository.findById(id);
		if (!category) {
			throw new NotFoundError('apiResponses.categories.notFound', { path: 'GetCategoryWithAuthorship.service' });
		}
		return category;
	}
}
