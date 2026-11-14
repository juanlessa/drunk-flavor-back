import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { ClearCreatorByUser } from './clearCreatorByUser.dtos';

export class ClearCreatorByUserService {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository,
		private unitsRepository: IUnitsRepository,
	) {}

	/** Removes the user as creator and last editor across the catalog and returns how many records were touched. */
	async execute({ userId }: ClearCreatorByUser): Promise<number> {
		const touched = [
			await this.drinksRepository.clearCreatorByUser(userId),
			await this.ingredientsRepository.clearCreatorByUser(userId),
			await this.categoriesRepository.clearCreatorByUser(userId),
			await this.unitsRepository.clearCreatorByUser(userId),
		];
		return touched.reduce((total, count) => total + count, 0);
	}
}
