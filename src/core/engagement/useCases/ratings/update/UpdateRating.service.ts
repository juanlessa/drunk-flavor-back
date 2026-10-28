import { IDrinksModule } from '@/core/drinks/public';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { defineAbilityFor } from '@/shared/accessControl';
import { ratingPermissionSchema } from '@/shared/accessControl/entities/rating';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { UpdateRatingCommand, UpdateRatingResult } from './updateRating.dtos';

export class UpdateRatingService {
	constructor(
		private ratingsRepository: IRatingsRepository,
		private drinksModule: IDrinksModule,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ id, value, actor }: UpdateRatingCommand): Promise<UpdateRatingResult> {
		return this.transactionManager.withTransaction(async () => {
			const rating = await this.ratingsRepository.findById(id);
			if (!rating) throw new BadRequestError('apiResponses.ratings.notExist', { path: 'UpdateRating.service' });

			const subject = ratingPermissionSchema.parse({
				id: rating.id,
				userId: rating.userId,
				drinkId: rating.drinkId,
			});
			const user = userPermissionSchema.parse({ id: actor.id, role: actor.role });
			if (defineAbilityFor(user).cannot('update', subject)) {
				throw new ForbiddenError('apiResponses.ratings.forbidden', { path: 'UpdateRating.service' });
			}
			await this.ratingsRepository.update({ id, value });
			const summary = await this.drinksModule.applyRatingDelta({
				drinkId: rating.drinkId,
				countDelta: 0,
				sumDelta: value - rating.value,
			});
			return { summary };
		});
	}
}
