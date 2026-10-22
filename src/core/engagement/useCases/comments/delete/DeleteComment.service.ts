import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { defineAbilityFor } from '@/shared/accessControl';
import { commentPermissionSchema } from '@/shared/accessControl/entities/comment';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { DeleteCommentCommand } from './deleteComment.dtos';

export class DeleteCommentService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute({ id, actor }: DeleteCommentCommand): Promise<void> {
		const comment = await this.commentsRepository.findById(id);
		if (!comment) {
			throw new BadRequestError('apiResponses.comments.notExist', { path: 'DeleteComment.service' });
		}

		const subject = commentPermissionSchema.parse({
			id: comment._id.toString(),
			user_id: comment.user_id,
			drink_id: comment.drink_id,
		});
		const user = userPermissionSchema.parse({ id: actor.id, role: actor.role });

		const { cannot } = defineAbilityFor(user);
		if (cannot('delete', subject)) {
			throw new ForbiddenError('apiResponses.comments.forbidden', { path: 'DeleteComment.service' });
		}

		await this.commentsRepository.delete(id);
	}
}
