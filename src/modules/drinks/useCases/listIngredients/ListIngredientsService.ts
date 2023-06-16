import { IIngredientsRepository } from '@modules/drinks/repositories/IIngredientsRepository';
import { Prisma } from '@prisma/client';
import { inject, injectable } from 'tsyringe';
import Ingredient from '@modules/drinks/entities/Ingredient';

@injectable()
class ListIngredientsService {
	constructor(
		@inject('IngredientsRepository')
		private ingredientsRepository: IIngredientsRepository
	) {}

	async execute(): Promise<Ingredient[]> {
		const ingredients = await this.ingredientsRepository.findAll();

		return ingredients;
	}
}

export { ListIngredientsService };
