import { IDeleteCategory } from '@modules/drinks/dtos/Categories';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/categoryErrors';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { deleteCategorySchema } from '@modules/drinks/validations/categories';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class DeleteCategoryService {
	constructor(
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}
	async execute(data: IDeleteCategory): Promise<void> {
		const result = deleteCategorySchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IDeleteCategory>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const categoryExists = await this.categoriesRepository.findById(id);

		if (!categoryExists) {
			throw new AppError(CATEGORY_ERRORS.not_exist);
		}

		await this.categoriesRepository.delete(id);
	}
}

export { DeleteCategoryService };
