import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { CreateCommentCommand } from './createComment.dtos';

export class CreateCommentService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute(command: CreateCommentCommand): Promise<string> {
		const comment = await this.commentsRepository.create({
			drink_id: command.drink_id,
			user_id: command.actor.id,
			content: command.content,
		});

		return comment._id.toString();
	}
}
