import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { defineAbilityFor } from '@/shared/accessControl';
import { commentPermissionSchema } from '@/shared/accessControl/entities/comment';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { UpdateCommentCommand } from './updateComment.dtos';

export class UpdateCommentService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute({ id, content, actor }: UpdateCommentCommand): Promise<void> {
		const comment = await this.commentsRepository.findById(id);
		if (!comment) throw new BadRequestError('apiResponses.comments.notExist', { path: 'UpdateComment.service' });

		const subject = commentPermissionSchema.parse({
			id: comment.id,
			userId: comment.userId,
			drinkId: comment.drinkId,
		});
		const user = userPermissionSchema.parse({ id: actor.id, role: actor.role });
		if (defineAbilityFor(user).cannot('update', subject)) {
			throw new ForbiddenError('apiResponses.comments.forbidden', { path: 'UpdateComment.service' });
		}
		await this.commentsRepository.update({ id, content });
	}
}
