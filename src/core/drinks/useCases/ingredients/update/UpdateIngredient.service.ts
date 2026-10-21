import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateIngredientReqBody } from './updateIngredient.dtos';

export class UpdateIngredientService {
	constructor(
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository,
		private unitsRepository: IUnitsRepository,
	) {}

	async execute({ id, translations, category_id, unit_id }: UpdateIngredientReqBody) {
		const ingredientExists = await this.ingredientsRepository.findById(id);
		if (!ingredientExists) {
			throw new BadRequestError('apiResponses.ingredients.notExist', { path: 'UpdateIngredient.service.1' });
		}

		const translationsName = mapToTranslationsName(translations);
		const ingredientNameALreadyExists = await this.ingredientsRepository.findByName(translationsName);
		if (
			ingredientNameALreadyExists &&
			ingredientExists._id.toString() !== ingredientNameALreadyExists._id.toString()
		) {
			throw new BadRequestError('apiResponses.ingredients.alreadyExist', { path: 'UpdateIngredient.service.2' });
		}

		const categoryExists = await this.categoriesRepository.findById(category_id);
		if (!categoryExists) {
			throw new BadRequestError('apiResponses.ingredients.invalidCategoryFormat', {
				path: 'UpdateIngredient.service.3',
			});
		}

		const unitExists = await this.unitsRepository.findById(unit_id);
		if (!unitExists) {
			throw new BadRequestError('apiResponses.ingredients.invalidUnitFormat', {
				path: 'UpdateIngredient.service.4',
			});
		}

		await this.ingredientsRepository.update({
			id,
			translations,
			category: categoryExists,
			unit: unitExists,
		});
	}
}
