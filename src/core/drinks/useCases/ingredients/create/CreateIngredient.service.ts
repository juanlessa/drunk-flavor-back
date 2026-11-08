import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { assertIngredientBrand } from '@/core/drinks/helpers/ingredient.helpers';
import { resolveIngredientUnits } from '@/core/drinks/mappers/ingredientUnits.mappers';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { BadRequestError, ConflictError } from '@/shared/error/error.lib';
import { CreateIngredientDTO } from './createIngredient.dtos';

export class CreateIngredientService {
	constructor(
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository,
		private unitsRepository: IUnitsRepository,
	) {}

	async execute({ translations, categoryId, unitIds, kind, brand }: CreateIngredientDTO): Promise<Ingredient> {
		assertIngredientBrand(kind ?? IngredientKinds.generic, brand, 'CreateIngredient.service.0');
		const translationsName = mapToTranslationsName(translations);
		const ingredientAlreadyExists = await this.ingredientsRepository.findByName(translationsName);
		if (ingredientAlreadyExists) {
			throw new ConflictError('apiResponses.ingredients.alreadyExist', { path: 'CreateIngredient.service.1' });
		}

		const categoryExists = await this.categoriesRepository.findById(categoryId);
		if (!categoryExists) {
			throw new BadRequestError('apiResponses.ingredients.invalidCategoryFormat', {
				path: 'CreateIngredient.service.2',
			});
		}

		const units = await resolveIngredientUnits(unitIds, this.unitsRepository, 'CreateIngredient.service.3');

		return this.ingredientsRepository.create({
			translations,
			category: categoryExists,
			units,
			kind,
			brand,
		});
	}
}
