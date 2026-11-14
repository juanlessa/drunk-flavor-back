import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListIngredientsService } from './listIngredients.container';
import { ListIngredientsReqQuery } from './listIngredients.dtos';

export const listIngredientsController: Controller<{ Querystring: ListIngredientsReqQuery }> = async (
	request,
	reply,
) => {
	const { limit, page, search, sort, inUse } = request.query;

	const service = resolveListIngredientsService();

	const ingredients = await service.execute({ query: { limit, page, search, sort }, inUse });

	return reply.send(ingredients);
};
