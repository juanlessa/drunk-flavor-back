import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetRatingService } from './getRating.container';
import { GetRatingReqParam } from './getRating.dtos';

export const getRatingController: Controller<{ Params: GetRatingReqParam }> = async (request, reply) => {
	const { id } = request.params;

	const service = resolveGetRatingService();
	const rating = await service.execute({ id });

	return reply.send(rating);
};
