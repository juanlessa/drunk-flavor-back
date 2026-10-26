import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveDeleteRatingService } from './deleteRating.container';
import { DeleteRatingReqParam } from './deleteRating.dtos';

export const deleteRatingController: Controller<{ Params: DeleteRatingReqParam }> = async (request, reply) => {
	const { id } = request.params;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveDeleteRatingService();
	const result = await service.execute({ id, actor });

	return reply.status(HTTP_STATUS.ok).send(result);
};
