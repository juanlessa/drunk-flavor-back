import { Comment } from '@/core/engagement/entities/comment.entity';
import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { ListMyCommentsCommand } from './listMyComments.dtos';

export class ListMyCommentsService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute({ query, actor }: ListMyCommentsCommand): Promise<Comment[]> {
		return this.commentsRepository.findByUser(actor.id, query);
	}
}
