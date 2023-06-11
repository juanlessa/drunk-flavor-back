import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { Prisma } from '@prisma/client';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';

const getIngredientSchema = z.object({
	id: z.string({ required_error: 'Ingredient id is required' }).length(24, { message: 'Ingredient does not exist.' })
});
type IGetIngredient = z.infer<typeof getIngredientSchema>;

type Ingredient = Prisma.IngredientCreateInput;

@injectable()
class GetIngredientService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}

	async execute(data: IGetIngredient): Promise<Ingredient> {
		const result = getIngredientSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IGetIngredient>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const ingredient = await this.ingredientsRepository.findById(id);

		if (!ingredient) {
			throw new AppError('Ingredient not found');
		}

		return ingredient;
	}
}

export { GetIngredientService };
