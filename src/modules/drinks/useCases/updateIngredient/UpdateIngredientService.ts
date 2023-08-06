import { IUpdateIngredient } from '@modules/drinks/dtos/ingredients';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';
import { ICategoriesRepository } from '@modules/drinks/repositories/ICategoriesRepository';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { updateIngredientSchema } from '@modules/drinks/validations/ingredients';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class UpdateIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository,
		@inject('CategoriesRepository')
		private categoriesRepository: ICategoriesRepository
	) {}
	async execute(data: IUpdateIngredient): Promise<void> {
		const result = updateIngredientSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IUpdateIngredient>;
			throw new AppError(error.issues[0].message);
		}
		const { id, name, categoryId, unitySingular, unityPlural, isAlcoholic } = result.data;

		const ingredientExists = await this.ingredientsRepository.findById(id);
		if (!ingredientExists) {
			throw new AppError(INGREDIENT_ERRORS.not_exist);
		}
		const ingredientNameALreadyExists = await this.ingredientsRepository.findByName(name);
		if (ingredientNameALreadyExists && ingredientExists.id !== ingredientNameALreadyExists.id) {
			throw new AppError(INGREDIENT_ERRORS.already_exist);
		}
		const categoryExists = await this.categoriesRepository.findById(categoryId);
		if (!categoryExists) {
			throw new AppError(INGREDIENT_ERRORS.invalid_category_id_format);
		}

		await this.ingredientsRepository.update({
			id,
			name,
			categoryId,
			unitySingular,
			unityPlural,
			isAlcoholic
		});
	}
}

export { UpdateIngredientService };
