import { Rating } from '@/core/engagement/entities/rating.entity';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { ListRatingsByDrinkCommand } from './listRatingsByDrink.dtos';

export class ListRatingsByDrinkService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ drinkId, query }: ListRatingsByDrinkCommand): Promise<Rating[]> {
		return this.ratingsRepository.findByDrink(drinkId, query);
	}
}
