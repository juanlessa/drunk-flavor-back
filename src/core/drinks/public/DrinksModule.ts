import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { ApplyRatingDelta, DrinkRatingSummary, IDrinksModule } from './IDrinksModule';

export class DrinksModule implements IDrinksModule {
	constructor(private drinksRepository: IDrinksRepository) {}

	findDrinkById(drinkId: string) {
		return this.drinksRepository.findById(drinkId);
	}

	applyRatingDelta(input: ApplyRatingDelta): Promise<DrinkRatingSummary> {
		return this.drinksRepository.applyRatingDelta(input);
	}
}
