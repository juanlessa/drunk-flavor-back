import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';

const updateIngredientSchema = z.object({
	id: z.string().length(24, { message: 'Ingredient does not exist!' }),
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

type IUpdateIngredient = z.infer<typeof updateIngredientSchema>;
@injectable()
class UpdateIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}
	async execute(data: IUpdateIngredient): Promise<void> {
		const result = updateIngredientSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IUpdateIngredient>;
			throw new AppError(error.issues[0].message);
		}
		const { id, name, category, unity, colorTheme, isAlcoholic } = result.data;

		const ingredientExists = await this.ingredientsRepository.findById(id);
		if (!ingredientExists) {
			throw new AppError('Ingredient does not exist');
		}
		const ingredientNameALreadyExists = await this.ingredientsRepository.findByName(name);
		if (ingredientNameALreadyExists && ingredientExists.id !== ingredientNameALreadyExists.id) {
			throw new AppError('Ingredient name already exists');
		}

		await this.ingredientsRepository.update({
			id,
			name,
			category,
			unity,
			colorTheme,
			isAlcoholic
		});
	}
}

export { UpdateIngredientService };
