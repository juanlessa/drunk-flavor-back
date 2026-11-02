import { IAccountsModule } from '@/core/accounts/public';
import { CommentWithAuthor } from '@/core/engagement/dtos/comment.dtos';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { ListCommentsByDrinkCommand } from './listCommentsByDrink.dtos';

export class ListCommentsByDrinkService {
	constructor(
		private commentsRepository: ICommentsRepository,
		private accountsModule: IAccountsModule,
	) {}

	/** Lists the visible comments of a drink, each enriched with its author's public profile. */
	async execute({ drinkId, query }: ListCommentsByDrinkCommand): Promise<CommentWithAuthor[]> {
		const comments = await this.commentsRepository.findByDrink(drinkId, query, {
			status: CommentStatuses.visible,
		});
		if (comments.length === 0) {
			return [];
		}
		const profiles = await this.accountsModule.findPublicProfilesByIds({
			userIds: comments.map((comment) => comment.userId),
		});
		const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
		return comments.map((comment) => ({ ...comment, author: profilesById.get(comment.userId) ?? null }));
	}
}
