import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { CreateCategoryDTO } from './createCategory.dtos';

export class CreateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ translations, isAlcoholic }: CreateCategoryDTO): Promise<void> {
		if (await this.categoriesRepository.findByName(mapToTranslationsName(translations))) {
			throw new BadRequestError('apiResponses.categories.alreadyExist', { path: 'CreateCategory.service' });
		}
		await this.categoriesRepository.create({ translations, isAlcoholic });
	}
}
