import { ICommentsRepository } from '@/core/engagement/repositories/IComments.repository';
import { defineAbilityFor } from '@/shared/accessControl';
import { commentPermissionSchema } from '@/shared/accessControl/entities/comment';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { ModerateCommentCommand } from './moderateComment.dtos';

export class ModerateCommentService {
	constructor(private commentsRepository: ICommentsRepository) {}

	async execute({ id, status, actor }: ModerateCommentCommand): Promise<void> {
		const comment = await this.commentsRepository.findById(id);
		if (!comment) throw new BadRequestError('apiResponses.comments.notExist', { path: 'ModerateComment.service' });

		const subject = commentPermissionSchema.parse({
			id: comment.id,
			userId: comment.userId,
			drinkId: comment.drinkId,
		});
		const user = userPermissionSchema.parse({ id: actor.id, role: actor.role });
		if (defineAbilityFor(user).cannot('moderate', subject)) {
			throw new ForbiddenError('apiResponses.comments.forbidden', { path: 'ModerateComment.service' });
		}
		await this.commentsRepository.updateStatus({ id, status });
	}
}
