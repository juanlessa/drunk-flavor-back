import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import {
	ApplyRatingDelta,
	DrinkRatingSummary,
	IDrinksModule,
} from '@/shared/providers/moduleCommunication/drinks';

export class DrinksModule implements IDrinksModule {
	constructor(private drinksRepository: IDrinksRepository) {}

	applyRatingDelta(input: ApplyRatingDelta): Promise<DrinkRatingSummary> {
		return this.drinksRepository.applyRatingDelta(input);
	}
}
