import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { createIngredientSchema } from '@modules/drinks/validations/ingredients';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class CreateIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository,
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}

	async execute(data: ICreateIngredient): Promise<void> {
		const result = createIngredientSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<ICreateIngredient>;
			throw new AppError(error.issues[0].message);
		}
		const { name, categoryId, unitySingular, unityPlural, isAlcoholic } = result.data;

		const ingredientALreadyExists = await this.ingredientsRepository.findByName(name);
		if (ingredientALreadyExists) {
			throw new AppError(INGREDIENT_ERRORS.already_exist);
		}

		const categoryExists = await this.categoriesRepository.findById(categoryId);
		if (!categoryExists) {
			throw new AppError(INGREDIENT_ERRORS.invalid_category_id_format);
		}

		await this.ingredientsRepository.create({
			name,
			categoryId,
			unitySingular,
			unityPlural,
			isAlcoholic
		});
	}
}

export { CreateIngredientService };
