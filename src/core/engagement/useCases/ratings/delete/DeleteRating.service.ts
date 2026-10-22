import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { defineAbilityFor } from '@/shared/accessControl';
import { ratingPermissionSchema } from '@/shared/accessControl/entities/rating';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { DeleteRatingCommand } from './deleteRating.dtos';

export class DeleteRatingService {
	constructor(private ratingsRepository: IRatingsRepository) {}

	async execute({ id, actor }: DeleteRatingCommand): Promise<void> {
		const rating = await this.ratingsRepository.findById(id);
		if (!rating) {
			throw new BadRequestError('apiResponses.ratings.notExist', { path: 'DeleteRating.service' });
		}

		const subject = ratingPermissionSchema.parse({
			id: rating._id.toString(),
			user_id: rating.user_id,
			drink_id: rating.drink_id,
		});
		const user = userPermissionSchema.parse({ id: actor.id, role: actor.role });

		const { cannot } = defineAbilityFor(user);
		if (cannot('delete', subject)) {
			throw new ForbiddenError('apiResponses.ratings.forbidden', { path: 'DeleteRating.service' });
		}

		await this.ratingsRepository.delete(id);
	}
}
