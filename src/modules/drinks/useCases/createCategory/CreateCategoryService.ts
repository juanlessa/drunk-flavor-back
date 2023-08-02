import { ICreateCategory } from '@modules/drinks/dtos/Categories';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/categoryErrors';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { createCategorySchema } from '@modules/drinks/validations/categories';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class CreateCategoryService {
	constructor(
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}

	async execute(data: ICreateCategory): Promise<void> {
		const result = createCategorySchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<ICreateCategory>;
			throw new AppError(error.issues[0].message);
		}
		const { name } = result.data;

		const categoryALreadyExists = await this.categoriesRepository.findByName(name);
		if (categoryALreadyExists) {
			throw new AppError(CATEGORY_ERRORS.already_exist);
		}

		await this.categoriesRepository.create({ name });
	}
}

export { CreateCategoryService };
