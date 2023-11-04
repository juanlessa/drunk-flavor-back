import { IDeleteCategory } from '@modules/drinks/dtos/category.dtos';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { BadRequestError } from '@shared/errors/error.lib';

class DeleteCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id }: IDeleteCategory): Promise<void> {
		const categoryExists = await this.categoriesRepository.findById(id);
		if (!categoryExists) {
			throw new BadRequestError(CATEGORY_ERRORS.not_exist, { path: 'DeleteCategory.service' });
		}

		await this.categoriesRepository.delete(id);
	}
}

export { DeleteCategoryService };
