import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { Comment } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { ListCommentsCommand } from './listComments.dtos';

export class ListCommentsService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute({ query }: ListCommentsCommand): Promise<Comment[]> {
		return this.commentsRepository.findAll(query, { status: CommentStatuses.visible });
	}
}
