import { IUpdateCategory } from '@modules/drinks/dtos/category.dtos';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { mapToTranslationsName } from '@modules/drinks/mappers/translations.mapper';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { BadRequestError } from '@shared/errors/error.lib';

class UpdateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id, translations }: IUpdateCategory): Promise<void> {
		const categoryExists = await this.categoriesRepository.findById(id);
		if (!categoryExists) {
			throw new BadRequestError(CATEGORY_ERRORS.not_exist, { path: 'UpdateCategory.service' });
		}

		const translationsName = mapToTranslationsName(translations);
		const categoryNameALreadyExists = await this.categoriesRepository.findByName(translationsName);
		if (categoryNameALreadyExists && categoryExists._id.toString() !== categoryNameALreadyExists._id.toString()) {
			throw new BadRequestError(CATEGORY_ERRORS.already_exist, { path: 'UpdateCategory.service' });
		}

		await this.categoriesRepository.update({
			id,
			translations
		});
	}
}

export { UpdateCategoryService };
