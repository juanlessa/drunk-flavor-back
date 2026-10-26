import { Rating } from '@/core/engagement/entities/rating.entity';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { ListMyRatingsCommand } from './listMyRatings.dtos';

export class ListMyRatingsService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ query, actor }: ListMyRatingsCommand): Promise<Rating[]> {
		return this.ratingsRepository.findByUser(actor.id, query);
	}
}
