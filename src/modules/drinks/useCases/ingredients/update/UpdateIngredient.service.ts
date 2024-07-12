import { mapToTranslationsName } from '@/modules/drinks/mappers/translations.mappers';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/modules/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { UpdateIngredientReqBody } from './updateIngredient.dtos';
import { INGREDIENT_MESSAGES } from '@/modules/drinks/constants/ingredients.constants';

export class UpdateIngredientService {
	constructor(
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository,
	) {}

	async execute({ id, translations, is_alcoholic, category_id }: UpdateIngredientReqBody) {
		const ingredientExists = await this.ingredientsRepository.findById(id);
		if (!ingredientExists) {
			throw new BadRequestError(INGREDIENT_MESSAGES.notExist.message, { path: 'UpdateIngredient.service.1' });
		}

		const translationsName = mapToTranslationsName(translations);
		const ingredientNameALreadyExists = await this.ingredientsRepository.findByName(translationsName);
		if (
			ingredientNameALreadyExists &&
			ingredientExists._id.toString() !== ingredientNameALreadyExists._id.toString()
		) {
			throw new BadRequestError(INGREDIENT_MESSAGES.alreadyExist.message, { path: 'UpdateIngredient.service.2' });
		}

		const categoryExists = await this.categoriesRepository.findById(category_id);
		if (!categoryExists) {
			throw new BadRequestError(INGREDIENT_MESSAGES.invalidCategoryFormat.message, {
				path: 'UpdateIngredient.service.3',
			});
		}

		await this.ingredientsRepository.update({ id, translations, is_alcoholic, category: categoryExists });
	}
}
