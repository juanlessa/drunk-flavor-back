import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { ApplyRatingDelta, DrinkRatingSummary } from './applyRatingDelta.dtos';

export class ApplyRatingDeltaService {
	constructor(private drinksRepository: IDrinksRepository) {}

	execute(data: ApplyRatingDelta): Promise<DrinkRatingSummary> {
		return this.drinksRepository.applyRatingDelta(data);
	}
}
