import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveAddFavoriteService } from './addFavorite.container';
import { AddFavoriteReqParam } from './addFavorite.dtos';

export const addFavoriteController: Controller<{ Params: AddFavoriteReqParam }> = async (request, reply) => {
	const { drinkId } = request.params;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveAddFavoriteService();
	await service.execute({ drinkId, actor });
	return reply.status(HTTP_STATUS.no_content).send();
};
