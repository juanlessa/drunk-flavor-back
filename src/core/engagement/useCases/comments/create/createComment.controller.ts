import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateCommentService } from './createComment.container';
import { CreateCommentReqBody } from './createComment.dtos';

export const createCommentController: Controller<{ Body: CreateCommentReqBody }> = async (request, reply) => {
	const { drink_id, content } = request.body;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveCreateCommentService();
	const id = await service.execute({ drink_id, content, actor });

	return reply.status(HTTP_STATUS.created).send({ id });
};
