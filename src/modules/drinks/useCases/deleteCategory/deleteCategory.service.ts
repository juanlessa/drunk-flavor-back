import { IDeleteCategory } from '@modules/drinks/dtos/category.dtos';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class DeleteCategoryService {
	constructor(
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}
	async execute({ id }: IDeleteCategory): Promise<void> {
		const categoryExists = await this.categoriesRepository.findById(id);
		if (!categoryExists) {
			throw new AppError(CATEGORY_ERRORS.not_exist);
		}

		await this.categoriesRepository.delete(id);
	}
}

export { DeleteCategoryService };
