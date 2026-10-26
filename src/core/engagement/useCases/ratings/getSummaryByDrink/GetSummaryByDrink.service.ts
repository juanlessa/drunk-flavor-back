import { RatingSummary } from '@/core/engagement/dtos/rating.dtos';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { GetSummaryByDrinkCommand } from './getSummaryByDrink.dtos';

export class GetSummaryByDrinkService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ drink_id }: GetSummaryByDrinkCommand): Promise<RatingSummary> {
		return this.ratingsRepository.summarizeByDrink(drink_id);
	}
}
