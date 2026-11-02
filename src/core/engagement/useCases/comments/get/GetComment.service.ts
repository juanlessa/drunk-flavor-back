import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { Comment } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { NotFoundError } from '@/shared/error/error.lib';
import { GetCommentCommand } from './getComment.dtos';

export class GetCommentService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute({ id }: GetCommentCommand): Promise<Comment> {
		const comment = await this.commentsRepository.findById(id);
		// Hidden and flagged comments are treated as missing to avoid status disclosure.
		if (!comment || comment.status !== CommentStatuses.visible) {
			throw new NotFoundError('apiResponses.comments.notFound', { path: 'GetComment.service' });
		}
		return comment;
	}
}
