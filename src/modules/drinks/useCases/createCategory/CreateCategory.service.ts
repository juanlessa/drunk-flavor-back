import { ICreateCategory } from '@modules/drinks/dtos/category.dtos';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { mapToTranslationsName } from '@modules/drinks/mappers/translations.mapper';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { BadRequestError } from '@shared/errors/error.lib';

class CreateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ translations }: ICreateCategory): Promise<void> {
		const translationsName = mapToTranslationsName(translations);
		const categoryALreadyExists = await this.categoriesRepository.findByName(translationsName);
		if (categoryALreadyExists) {
			throw new BadRequestError(CATEGORY_ERRORS.already_exist, { path: 'CreateCategory.service' });
		}

		await this.categoriesRepository.create({ translations });
	}
}

export { CreateCategoryService };
