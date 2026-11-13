import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListMyFavoriteDrinkIdsService } from './listMyFavoriteDrinkIds.container';

export const listMyFavoriteDrinkIdsController: Controller = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveListMyFavoriteDrinkIdsService();
	const result = await service.execute({ actor });
	return reply.send(result);
};
