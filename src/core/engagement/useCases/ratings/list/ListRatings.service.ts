import { Rating } from '@/core/engagement/entities/rating.entity';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { ListRatingsCommand } from './listRatings.dtos';

export class ListRatingsService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ query }: ListRatingsCommand): Promise<Rating[]> {
		return this.ratingsRepository.findAll(query);
	}
}
