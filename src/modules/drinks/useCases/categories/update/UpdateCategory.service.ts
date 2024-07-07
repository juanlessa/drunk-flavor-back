import { mapToTranslationsName } from '@/modules/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { CATEGORY_MESSAGES } from '@/modules/drinks/constants/categories.constants';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateCategoryReqBody } from './updateCategory.dtos';

export class UpdateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id, translations }: UpdateCategoryReqBody) {
		const categoryExists = await this.categoriesRepository.findById(id);
		if (!categoryExists) {
			throw new BadRequestError(CATEGORY_MESSAGES.notExist.message, { path: 'UpdateCategory.service' });
		}

		const translationsName = mapToTranslationsName(translations);
		const categoryNameALreadyExists = await this.categoriesRepository.findByName(translationsName);
		if (categoryNameALreadyExists && categoryExists._id.toString() !== categoryNameALreadyExists._id.toString()) {
			throw new BadRequestError(CATEGORY_MESSAGES.alreadyExist.message, { path: 'UpdateCategory.service' });
		}

		await this.categoriesRepository.update({
			id,
			translations,
		});
	}
}
