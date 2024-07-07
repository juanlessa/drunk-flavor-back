import { CreateCategory } from '@/modules/drinks/dtos/category.dtos';
import { mapToTranslationsName } from '@/modules/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { CATEGORY_MESSAGES } from '@/modules/drinks/constants/categories.constants';
import { BadRequestError } from '@/shared/error/error.lib';

export class CreateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ translations }: CreateCategory) {
		const translationsName = mapToTranslationsName(translations);
		const categoryALreadyExists = await this.categoriesRepository.findByName(translationsName);
		if (categoryALreadyExists) {
			throw new BadRequestError(CATEGORY_MESSAGES.alreadyExist.message, { path: 'CreateCategory.service' });
		}

		await this.categoriesRepository.create({ translations });
	}
}
