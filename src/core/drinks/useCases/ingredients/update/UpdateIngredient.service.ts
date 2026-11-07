import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { assertIngredientBrand } from '@/core/drinks/helpers/ingredient.helpers';
import { resolveIngredientUnits } from '@/core/drinks/mappers/ingredientUnits.mappers';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { BadRequestError, NotFoundError, ConflictError } from '@/shared/error/error.lib';
import { UpdateIngredientDTO } from './updateIngredient.dtos';

export class UpdateIngredientService {
	constructor(
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository,
		private unitsRepository: IUnitsRepository,
	) {}

	async execute({ id, translations, categoryId, unitIds, kind, brand }: UpdateIngredientDTO): Promise<void> {
		const ingredient = await this.ingredientsRepository.findById(id);
		if (!ingredient) {
			throw new NotFoundError('apiResponses.ingredients.notFound', { path: 'UpdateIngredient.service.1' });
		}
		const duplicate = await this.ingredientsRepository.findByName(mapToTranslationsName(translations));
		if (duplicate && duplicate.id !== ingredient.id) {
			throw new ConflictError('apiResponses.ingredients.alreadyExist', { path: 'UpdateIngredient.service.2' });
		}
		const category = await this.categoriesRepository.findById(categoryId);
		if (!category) {
			throw new BadRequestError('apiResponses.ingredients.invalidCategoryFormat', {
				path: 'UpdateIngredient.service.3',
			});
		}
		const units = await resolveIngredientUnits(unitIds, this.unitsRepository, 'UpdateIngredient.service.4');

		// The kind and brand the ingredient will have after this update: an omitted value keeps the
		// current one, and a generic ingredient never keeps a brand.
		const finalKind = kind ?? ingredient.kind;
		const keptBrand = finalKind === IngredientKinds.generic ? undefined : ingredient.brand;
		const finalBrand = brand === undefined ? keptBrand : brand;
		assertIngredientBrand(finalKind, finalBrand, 'UpdateIngredient.service.5');

		await this.ingredientsRepository.update({
			id,
			translations,
			category,
			units,
			kind,
			brand: finalKind === IngredientKinds.generic ? null : brand,
		});
	}
}
