import { ICreateCategory } from '@modules/drinks/dtos/category.dtos';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { mapToTranslationsName } from '@modules/drinks/mappers/translations.mapper';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import AppError from '@shared/errors/AppError';

class CreateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

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
