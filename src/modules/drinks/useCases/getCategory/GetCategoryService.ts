import { IGetCategory } from '@modules/drinks/dtos/Categories';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/categoryErrors';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { getCategorySchema } from '@modules/drinks/validations/categories';
import { Category } from '@prisma/client';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class GetCategoryService {
	constructor(
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}

	async execute(data: IGetCategory): Promise<Category> {
		const result = getCategorySchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IGetCategory>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const category = await this.categoriesRepository.findById(id);

		if (!category) {
			throw new AppError(CATEGORY_ERRORS.not_found);
		}

		return category;
	}
}

export { GetCategoryService };
