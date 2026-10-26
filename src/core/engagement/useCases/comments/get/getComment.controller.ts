import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetCommentService } from './getComment.container';
import { GetCommentReqParam } from './getComment.dtos';

export const getCommentController: Controller<{ Params: GetCommentReqParam }> = async (request, reply) => {
	const { id } = request.params;

	const service = resolveGetCommentService();
	const comment = await service.execute({ id });

	return reply.send(comment);
};
