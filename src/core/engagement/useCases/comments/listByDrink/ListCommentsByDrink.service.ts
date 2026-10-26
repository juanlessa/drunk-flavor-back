import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { Comment } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { ListCommentsByDrinkCommand } from './listCommentsByDrink.dtos';

export class ListCommentsByDrinkService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute({ drink_id, query }: ListCommentsByDrinkCommand): Promise<Comment[]> {
		return this.commentsRepository.findByDrink(drink_id, query, {
			status: CommentStatuses.visible,
		});
	}
}
