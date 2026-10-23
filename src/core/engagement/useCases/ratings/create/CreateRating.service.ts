import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { CreateRatingCommand } from './createRating.dtos';

export class CreateRatingService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ drink_id, value, actor }: CreateRatingCommand): Promise<string> {
		const existing = await this.ratingsRepository.findByDrinkAndUser(drink_id, actor.id);
		if (existing) {
			throw new BadRequestError('apiResponses.ratings.alreadyExist', { path: 'CreateRating.service' });
		}

		const rating = await this.ratingsRepository.create({
			drink_id,
			user_id: actor.id,
			value,
		});

		return rating._id.toString();
	}
}
