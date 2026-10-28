import { IDrinksModule } from '@/core/drinks/public';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { defineAbilityFor } from '@/shared/accessControl';
import { ratingPermissionSchema } from '@/shared/accessControl/entities/rating';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { DeleteRatingCommand, DeleteRatingResult } from './deleteRating.dtos';

export class DeleteRatingService {
	constructor(
		private ratingsRepository: IRatingsRepository,
		private drinksModule: IDrinksModule,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ id, actor }: DeleteRatingCommand): Promise<DeleteRatingResult> {
		return this.transactionManager.withTransaction(async () => {
			const rating = await this.ratingsRepository.findById(id);
			if (!rating) throw new BadRequestError('apiResponses.ratings.notExist', { path: 'DeleteRating.service' });

			const subject = ratingPermissionSchema.parse({
				id: rating.id,
				userId: rating.userId,
				drinkId: rating.drinkId,
			});
			const user = userPermissionSchema.parse({ id: actor.id, role: actor.role });
			if (defineAbilityFor(user).cannot('delete', subject)) {
				throw new ForbiddenError('apiResponses.ratings.forbidden', { path: 'DeleteRating.service' });
			}
			const deletedRating = await this.ratingsRepository.delete(id);
			const summary = await this.drinksModule.applyRatingDelta({
				drinkId: deletedRating.drinkId,
				countDelta: -1,
				sumDelta: -deletedRating.value,
			});
			return { summary };
		});
	}
}
