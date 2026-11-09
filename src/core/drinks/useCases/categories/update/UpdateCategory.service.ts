import { assertCanChangeCategory } from '@/core/drinks/helpers/catalogAuthorization.helpers';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { NotFoundError, ConflictError } from '@/shared/error/error.lib';
import { UpdateCategoryDTO } from './updateCategory.dtos';

export class UpdateCategoryService {
	constructor(private categoriesRepository: ICategoriesRepository) {}

	async execute({ id, translations, isAlcoholic, actor }: UpdateCategoryDTO): Promise<void> {
		const category = await this.categoriesRepository.findById(id);
		if (!category) throw new NotFoundError('apiResponses.categories.notFound', { path: 'UpdateCategory.service' });
		assertCanChangeCategory('update', category, actor, 'UpdateCategory.service.forbidden');
		const duplicate = await this.categoriesRepository.findByName(mapToTranslationsName(translations));
		if (duplicate && duplicate.id !== category.id) {
			throw new ConflictError('apiResponses.categories.alreadyExist', { path: 'UpdateCategory.service' });
		}
		await this.categoriesRepository.update({ id, translations, isAlcoholic, updatedBy: actor.id });
	}
}
