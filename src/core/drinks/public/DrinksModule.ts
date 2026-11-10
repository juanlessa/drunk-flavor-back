import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { ApplyRatingDelta, DrinkRatingSummary, IDrinksModule } from './IDrinksModule';

export class DrinksModule implements IDrinksModule {
	constructor(
		private drinksRepository: IDrinksRepository,
		private ingredientsRepository: IIngredientsRepository,
		private categoriesRepository: ICategoriesRepository,
		private unitsRepository: IUnitsRepository,
	) {}

	findDrinkById(drinkId: string) {
		return this.drinksRepository.findById(drinkId);
	}

	applyRatingDelta(input: ApplyRatingDelta): Promise<DrinkRatingSummary> {
		return this.drinksRepository.applyRatingDelta(input);
	}

	async clearCreatorByUser(userId: string): Promise<number> {
		const touched = [
			await this.drinksRepository.clearCreatorByUser(userId),
			await this.ingredientsRepository.clearCreatorByUser(userId),
			await this.categoriesRepository.clearCreatorByUser(userId),
			await this.unitsRepository.clearCreatorByUser(userId),
		];
		return touched.reduce((total, count) => total + count, 0);
	}
}
