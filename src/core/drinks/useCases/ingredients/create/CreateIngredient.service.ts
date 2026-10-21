import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { CreateIngredientDTO } from './createIngredient.dtos';

export class CreateIngredientService {
	constructor(
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository,
		private unitsRepository: IUnitsRepository,
	) {}

	async execute({ translations, category_id, unit_id }: CreateIngredientDTO) {
		const translationsName = mapToTranslationsName(translations);
		const ingredientALreadyExists = await this.ingredientsRepository.findByName(translationsName);
		if (ingredientALreadyExists) {
			throw new BadRequestError('apiResponses.ingredients.alreadyExist', { path: 'CreateIngredient.service.1' });
		}

		const categoryExists = await this.categoriesRepository.findById(category_id);

		if (!categoryExists) {
			throw new BadRequestError('apiResponses.ingredients.invalidCategoryFormat', {
				path: 'CreateIngredient.service.2',
			});
		}

		const unitExists = await this.unitsRepository.findById(unit_id);

		if (!unitExists) {
			throw new BadRequestError('apiResponses.ingredients.invalidUnitFormat', {
				path: 'CreateIngredient.service.3',
			});
		}

		await this.ingredientsRepository.create({
			translations,
			category: categoryExists,
			unit: unitExists,
		});
	}
}
