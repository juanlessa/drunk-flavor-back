import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListMyRatingsService } from './listMyRatings.container';
import { ListMyRatingsReqQuery } from './listMyRatings.dtos';

export const listMyRatingsController: Controller<{ Querystring: ListMyRatingsReqQuery }> = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	const { query } = request;

	const service = resolveListMyRatingsService();
	const ratings = await service.execute({ query, actor });

	return reply.send(ratings);
};
