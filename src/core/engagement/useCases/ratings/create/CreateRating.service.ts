import { IDrinksModule } from '@/shared/providers/moduleCommunication/drinks';
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

	async execute({ drink_id, value, actor }: CreateRatingCommand): Promise<CreateRatingResult> {
		return this.transactionManager.withTransaction(async () => {
			const existing = await this.ratingsRepository.findByDrinkAndUser(drink_id, actor.id);
			if (existing) {
				throw new BadRequestError('apiResponses.ratings.alreadyExist', { path: 'CreateRating.service' });
			}

			const rating = await this.ratingsRepository.create({
				drink_id,
				user_id: actor.id,
				value,
			});
			const summary = await this.drinksModule.applyRatingDelta({
				drinkId: drink_id,
				countDelta: 1,
				sumDelta: value,
			});

			return { id: rating._id.toString(), summary };
		});
	}
}
