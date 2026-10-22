import { CommentStatus } from '@/core/engagement/entities/comment.entity';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveModerateCommentService } from './moderateComment.container';
import { ModerateCommentReqBody, ModerateCommentReqParam } from './moderateComment.dtos';

export const moderateCommentController: Controller<{
	Params: ModerateCommentReqParam;
	Body: ModerateCommentReqBody;
}> = async (request, reply) => {
	const { id } = request.params;
	const { status } = request.body;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveModerateCommentService();
	await service.execute({ id, status, actor });

	return reply.status(HTTP_STATUS.no_content).send();
};
