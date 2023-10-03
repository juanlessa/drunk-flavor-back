import { ICreateIngredientRequest } from '@modules/drinks/dtos/ingredient.dtos';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { mapToTranslationsName } from '@modules/drinks/mappers/translations.mapper';
import { ICategoriesRepository } from '@modules/drinks/repositories/categories.repository.interface';
import { IIngredientsRepository } from '@modules/drinks/repositories/ingredients.repository.interface';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class CreateIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository,
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}

	async execute({ translations, is_alcoholic, category_id }: ICreateIngredientRequest): Promise<void> {
		const translationsName = mapToTranslationsName(translations);
		const ingredientALreadyExists = await this.ingredientsRepository.findByName(translationsName);
		if (ingredientALreadyExists) {
			throw new AppError(INGREDIENT_ERRORS.already_exist);
		}

		const categoryExists = await this.categoriesRepository.findById(category_id);

		if (!categoryExists) {
			throw new AppError(INGREDIENT_ERRORS.invalid_category_format);
		}

		await this.ingredientsRepository.create({ translations, is_alcoholic, category: categoryExists });
	}
}

export { CreateIngredientService };
