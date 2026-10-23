import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateRatingService } from './updateRating.container';
import { UpdateRatingReqBody, UpdateRatingReqParam } from './updateRating.dtos';

export const updateRatingController: Controller<{
	Params: UpdateRatingReqParam;
	Body: UpdateRatingReqBody;
}> = async (request, reply) => {
	const { id } = request.params;
	const { value } = request.body;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveUpdateRatingService();
	await service.execute({ id, value, actor });

	return reply.status(HTTP_STATUS.no_content).send();
};
