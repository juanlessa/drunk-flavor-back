import { Rating } from '@/core/engagement/entities/rating.entity';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { GetRatingCommand } from './getRating.dtos';

export class GetRatingService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ id }: GetRatingCommand): Promise<Rating> {
		const rating = await this.ratingsRepository.findById(id);
		if (!rating) {
			throw new BadRequestError('apiResponses.ratings.notFound', { path: 'GetRating.service' });
		}
		return rating;
	}
}
