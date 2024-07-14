import { INGREDIENT_MESSAGES } from '@/core/drinks/constants/ingredients.constants';
import { mapToTranslationsName } from '@/core/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { CreateIngredientDTO } from './createIngredient.dtos';

export class CreateIngredientService {
	constructor(
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository,
	) {}

	async execute({ translations, is_alcoholic, category_id }: CreateIngredientDTO) {
		const translationsName = mapToTranslationsName(translations);
		const ingredientALreadyExists = await this.ingredientsRepository.findByName(translationsName);
		if (ingredientALreadyExists) {
			throw new BadRequestError(INGREDIENT_MESSAGES.alreadyExist.message, { path: 'CreateIngredient.service.1' });
		}

		const categoryExists = await this.categoriesRepository.findById(category_id);

		if (!categoryExists) {
			throw new BadRequestError(INGREDIENT_MESSAGES.invalidCategoryFormat.message, {
				path: 'CreateIngredient.service.2',
			});
		}

		await this.ingredientsRepository.create({ translations, is_alcoholic, category: categoryExists });
	}
}
