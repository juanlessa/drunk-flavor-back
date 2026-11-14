import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListMyFavoritesService } from './listMyFavorites.container';
import { ListMyFavoritesReqQuery } from './listMyFavorites.dtos';

export const listMyFavoritesController: Controller<{ Querystring: ListMyFavoritesReqQuery }> = async (
	request,
	reply,
) => {
	const actor = { id: request.user.id, role: request.user.role };
	const { query } = request;
	const service = resolveListMyFavoritesService();
	const page = await service.execute({ query, actor });
	return reply.send(page);
};
