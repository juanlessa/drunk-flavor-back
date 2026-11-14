import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveDeleteCommentService } from './deleteComment.container';
import { DeleteCommentReqParam } from './deleteComment.dtos';

export const deleteCommentController: Controller<{ Params: DeleteCommentReqParam }> = async (request, reply) => {
	const { id } = request.params;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveDeleteCommentService();
	await service.execute({ id, actor });

	return reply.status(HTTP_STATUS.no_content).send();
};
