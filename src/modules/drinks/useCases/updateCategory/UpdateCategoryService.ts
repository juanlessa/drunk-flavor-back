import { IUpdateCategory } from '@modules/drinks/dtos/Categories';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/categoryErrors';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { updateCategorySchema } from '@modules/drinks/validations/categories';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class UpdateCategoryService {
	constructor(
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}
	async execute(data: IUpdateCategory): Promise<void> {
		const result = updateCategorySchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IUpdateCategory>;
			throw new AppError(error.issues[0].message);
		}
		const { id, name } = result.data;

		const categoryExists = await this.categoriesRepository.findById(id);
		if (!categoryExists) {
			throw new AppError(CATEGORY_ERRORS.not_exist);
		}
		const categoryNameALreadyExists = await this.categoriesRepository.findByName(name);
		if (categoryNameALreadyExists && categoryExists.id !== categoryNameALreadyExists.id) {
			throw new AppError(CATEGORY_ERRORS.already_exist);
		}

		await this.categoriesRepository.update({
			id,
			name
		});
	}
}

export { UpdateCategoryService };
