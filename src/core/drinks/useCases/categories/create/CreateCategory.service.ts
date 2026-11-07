import { Category } from '@/core/drinks/entities/category.entity';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { ConflictError } from '@/shared/error/error.lib';
import { CreateCategoryDTO } from './createCategory.dtos';

export class CreateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ translations, isAlcoholic }: CreateCategoryDTO): Promise<Category> {
		if (await this.categoriesRepository.findByName(mapToTranslationsName(translations))) {
			throw new ConflictError('apiResponses.categories.alreadyExist', { path: 'CreateCategory.service' });
		}
		return this.categoriesRepository.create({ translations, isAlcoholic });
	}
}
