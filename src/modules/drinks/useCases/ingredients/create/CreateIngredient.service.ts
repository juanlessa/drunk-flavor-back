import { INGREDIENT_MESSAGES } from '@/modules/drinks/constants/ingredients.constants';
import { mapToTranslationsName } from '@/modules/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';
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
