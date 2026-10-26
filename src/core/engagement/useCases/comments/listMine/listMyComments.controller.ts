import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListMyCommentsService } from './listMyComments.container';
import { ListMyCommentsReqQuery } from './listMyComments.dtos';

export const listMyCommentsController: Controller<{ Querystring: ListMyCommentsReqQuery }> = async (request, reply) => {
	const { query } = request;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveListMyCommentsService();
	const comments = await service.execute({ query, actor });

	return reply.send(comments);
};
