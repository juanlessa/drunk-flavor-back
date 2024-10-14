import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateCategoryReqBody } from './updateCategory.dtos';

export class UpdateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id, translations }: UpdateCategoryReqBody) {
		const categoryExists = await this.categoriesRepository.findById(id);
		if (!categoryExists) {
			throw new BadRequestError('apiResponses.categories.notExist', { path: 'UpdateCategory.service' });
		}

		const translationsName = mapToTranslationsName(translations);
		const categoryNameALreadyExists = await this.categoriesRepository.findByName(translationsName);
		if (categoryNameALreadyExists && categoryExists._id.toString() !== categoryNameALreadyExists._id.toString()) {
			throw new BadRequestError('apiResponses.categories.alreadyExist', { path: 'UpdateCategory.service' });
		}

		await this.categoriesRepository.update({
			id,
			translations,
		});
	}
}
