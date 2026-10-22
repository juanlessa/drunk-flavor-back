import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListRatingsService } from './listRatings.container';
import { ListRatingsReqQuery } from './listRatings.dtos';

export const listRatingsController: Controller<{ Querystring: ListRatingsReqQuery }> = async (request, reply) => {
	const { query } = request;

	const service = resolveListRatingsService();
	const ratings = await service.execute({ query });

	return reply.send(ratings);
};
