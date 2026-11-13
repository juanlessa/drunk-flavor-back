import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { DeleteEngagementByDrink, DeleteEngagementByDrinkResult } from './deleteEngagementByDrink.dtos';

export class DeleteEngagementByDrinkService {
	constructor(
		private commentsRepository: ICommentsRepository,
		private ratingsRepository: IRatingsRepository,
	) {}

	/** Deletes every comment and rating of the drink and returns how many of each were removed. */
	async execute({ drinkId }: DeleteEngagementByDrink): Promise<DeleteEngagementByDrinkResult> {
		const comments = await this.commentsRepository.deleteByDrink(drinkId);
		const ratings = await this.ratingsRepository.deleteByDrink(drinkId);
		return { comments, ratings };
	}
}
