import { assertCanChangeCategory } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { DeleteCategoryDTO } from './deleteCategory.dtos';

export class DeleteCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}
	async execute({ id, actor }: DeleteCategoryDTO) {
		const category = await this.categoriesRepository.findById(id);
		if (!category) {
			throw new NotFoundError('apiResponses.categories.notFound', { path: 'DeleteCategory.service' });
		}
		assertCanChangeCategory('delete', category, actor, 'DeleteCategory.service.forbidden');
		await this.categoriesRepository.delete(id);
	}
}
