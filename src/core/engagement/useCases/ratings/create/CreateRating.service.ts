import { IDrinksModule } from '@/core/drinks/public';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { CreateRatingCommand, CreateRatingResult } from './createRating.dtos';

export class CreateRatingService {
	constructor(
		private ratingsRepository: IRatingsRepository,
		private drinksModule: IDrinksModule,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ drinkId, value, actor }: CreateRatingCommand): Promise<CreateRatingResult> {
		return this.transactionManager.withTransaction(async () => {
			if (await this.ratingsRepository.findByDrinkAndUser(drinkId, actor.id)) {
				throw new BadRequestError('apiResponses.ratings.alreadyExist', { path: 'CreateRating.service' });
			}
			const rating = await this.ratingsRepository.create({ drinkId, userId: actor.id, value });
			const summary = await this.drinksModule.applyRatingDelta({ drinkId, countDelta: 1, sumDelta: value });
			return { id: rating.id, summary };
		});
	}
}
