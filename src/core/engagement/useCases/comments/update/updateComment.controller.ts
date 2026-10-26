import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateCommentService } from './updateComment.container';
import { UpdateCommentReqBody, UpdateCommentReqParam } from './updateComment.dtos';

export const updateCommentController: Controller<{
	Params: UpdateCommentReqParam;
	Body: UpdateCommentReqBody;
}> = async (request, reply) => {
	const { id } = request.params;
	const { content } = request.body;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveUpdateCommentService();
	await service.execute({ id, content, actor });

	return reply.status(HTTP_STATUS.no_content).send();
};
