import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateCategoryDTO } from './updateCategory.dtos';

export class UpdateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id, translations, isAlcoholic }: UpdateCategoryDTO): Promise<void> {
		const category = await this.categoriesRepository.findById(id);
		if (!category)
			throw new BadRequestError('apiResponses.categories.notExist', { path: 'UpdateCategory.service' });
		if (translations) {
			const duplicate = await this.categoriesRepository.findByName(mapToTranslationsName(translations));
			if (duplicate && duplicate.id !== category.id) {
				throw new BadRequestError('apiResponses.categories.alreadyExist', { path: 'UpdateCategory.service' });
			}
		}
		await this.categoriesRepository.update({ id, translations, isAlcoholic });
	}
}
