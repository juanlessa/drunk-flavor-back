import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';

interface IResponse {
	id: string;
}
const createIngredientSchema = z.object({
	name: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, { message: 'Ingredient must have a name' })
		.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`),
	unity: z.string().trim().toLowerCase().min(1, { message: 'Ingredient must have an unity' }),
	category: z.string().trim().toLowerCase().min(1, { message: 'Ingredient must have a category' }),
	isAlcoholic: z.boolean(),
	colorTheme: z
		.string()
		.trim()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: ' Ingredient must be a Hex color like #aabbcc' })
});

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
			throw new AppError('Ingredient already exists');
		}

		const ingredient = await this.ingredientsRepository.create({ name, unity, category, isAlcoholic, colorTheme });

		return { id: ingredient.id };
	}
}

export { CreateIngredientService };
