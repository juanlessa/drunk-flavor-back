import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListIngredientsService } from './listIngredients.container';
import { ListIngredientsReqQuery } from './listIngredients.dtos';

export const listIngredientsController: Controller = async (request, reply) => {
	const { limit, page, search, sort } = request.query as ListIngredientsReqQuery;

	const service = resolveListIngredientsService();

	const ingredients = await service.execute({ query: { limit, page, search, sort } });

	return reply.send(ingredients);
};
