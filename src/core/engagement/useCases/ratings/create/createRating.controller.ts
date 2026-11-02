import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateRatingService } from './createRating.container';
import { CreateRatingReqBody } from './createRating.dtos';

export const createRatingController: Controller<{ Body: CreateRatingReqBody }> = async (request, reply) => {
	const { drinkId, value } = request.body;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveCreateRatingService();
	const result = await service.execute({ drinkId, value, actor });

	return reply.status(HTTP_STATUS.created).send(result);
};
