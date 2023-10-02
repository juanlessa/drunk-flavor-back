import { ICreateCategory } from '@modules/drinks/dtos/category.dtos';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { mapToTranslationsName } from '@modules/drinks/mappers/translations.mapper';
import { ICategoriesRepository } from '@modules/drinks/repositories/categories.repository.interface';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class CreateCategoryService {
	constructor(
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}

	async execute({ translations }: ICreateCategory): Promise<void> {
		const translationsName = mapToTranslationsName(translations);
		const categoryALreadyExists = await this.categoriesRepository.findByName(translationsName);
		if (categoryALreadyExists) {
			throw new AppError(CATEGORY_ERRORS.already_exist);
		}

		await this.categoriesRepository.create({ translations });
	}
}

export { CreateCategoryService };
