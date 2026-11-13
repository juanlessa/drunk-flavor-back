import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { DeleteCommentsByUser } from './deleteCommentsByUser.dtos';

export class DeleteCommentsByUserService {
	constructor(private commentsRepository: ICommentsRepository) {}

	/** Deletes every comment written by the user and returns how many were removed. */
	execute({ userId }: DeleteCommentsByUser): Promise<number> {
		return this.commentsRepository.deleteByUser(userId);
	}
}
