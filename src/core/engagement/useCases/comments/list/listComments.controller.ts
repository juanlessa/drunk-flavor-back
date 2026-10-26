import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListCommentsService } from './listComments.container';
import { ListCommentsReqQuery } from './listComments.dtos';

export const listCommentsController: Controller<{ Querystring: ListCommentsReqQuery }> = async (request, reply) => {
	const { query } = request;

	const service = resolveListCommentsService();
	const comments = await service.execute({ query });

	return reply.send(comments);
};
