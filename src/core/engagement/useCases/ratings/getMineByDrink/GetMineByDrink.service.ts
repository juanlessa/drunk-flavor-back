import { Rating } from '@/core/engagement/entities/rating.entity';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { GetMineByDrinkCommand } from './getMineByDrink.dtos';

export class GetMineByDrinkService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ drinkId, actor }: GetMineByDrinkCommand): Promise<Rating | null> {
		return this.ratingsRepository.findByDrinkAndUser(drinkId, actor.id);
	}
}
