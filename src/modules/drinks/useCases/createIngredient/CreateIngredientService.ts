import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';
import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { createIngredientSchema } from '@modules/drinks/validations/ingredients';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

interface IResponse {
	id: string;
}

@injectable()
class CreateIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}

	async execute(data: ICreateIngredient): Promise<IResponse> {
		const result = createIngredientSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<ICreateIngredient>;
			throw new AppError(error.issues[0].message);
		}
		const { name, unity, category, isAlcoholic, colorTheme } = result.data;

		const ingredientALreadyExists = await this.ingredientsRepository.findByName(name);
		if (ingredientALreadyExists) {
			throw new AppError(INGREDIENT_ERRORS.already_exist);
		}

		const ingredient = await this.ingredientsRepository.create({ name, unity, category, isAlcoholic, colorTheme });

		return { id: ingredient.id };
	}
}

export { CreateIngredientService };
