import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveRemoveFavoriteService } from './removeFavorite.container';
import { RemoveFavoriteReqParam } from './removeFavorite.dtos';

export const removeFavoriteController: Controller<{ Params: RemoveFavoriteReqParam }> = async (request, reply) => {
	const { drinkId } = request.params;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveRemoveFavoriteService();
	await service.execute({ drinkId, actor });
	return reply.status(HTTP_STATUS.no_content).send();
};
