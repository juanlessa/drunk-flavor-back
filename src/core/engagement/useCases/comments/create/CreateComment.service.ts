import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CreateCommentCommand } from './createComment.dtos';

export class CreateCommentService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute({ drinkId, content, actor }: CreateCommentCommand): Promise<string> {
		const comment = await this.commentsRepository.create({ drinkId, userId: actor.id, content });
		return comment.id;
	}
}
