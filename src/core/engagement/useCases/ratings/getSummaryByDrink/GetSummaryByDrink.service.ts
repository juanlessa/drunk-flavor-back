import { RatingSummary } from '@/core/engagement/dtos/rating.dtos';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { GetSummaryByDrinkCommand } from './getSummaryByDrink.dtos';

export class GetSummaryByDrinkService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ drinkId }: GetSummaryByDrinkCommand): Promise<RatingSummary> {
		return this.ratingsRepository.summarizeByDrink(drinkId);
	}
}
