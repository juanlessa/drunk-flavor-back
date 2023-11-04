import { ICreateIngredientRequest } from '@modules/drinks/dtos/ingredient.dtos';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { mapToTranslationsName } from '@modules/drinks/mappers/translations.mapper';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@shared/errors/error.lib';

class CreateIngredientService {
	constructor(
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository
	) {}

	async execute({ translations, is_alcoholic, category_id }: ICreateIngredientRequest): Promise<void> {
		const translationsName = mapToTranslationsName(translations);
		const ingredientALreadyExists = await this.ingredientsRepository.findByName(translationsName);
		if (ingredientALreadyExists) {
			throw new BadRequestError(INGREDIENT_ERRORS.already_exist, { path: 'CreateIngredient.service' });
		}

		const categoryExists = await this.categoriesRepository.findById(category_id);

		if (!categoryExists) {
			throw new BadRequestError(INGREDIENT_ERRORS.invalid_category_format, { path: 'CreateIngredient.service' });
		}

		await this.ingredientsRepository.create({ translations, is_alcoholic, category: categoryExists });
	}
}

export { CreateIngredientService };
