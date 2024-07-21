import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { ListDrinksReqQuery } from './listDrinks.dtos';
import { resolveListDrinksService } from './listDrinks.container';

export const listDrinksController: Controller = async (request, reply) => {
	const { limit, page, search, sort } = request.query as ListDrinksReqQuery;

	const service = resolveListDrinksService();

	const drinks = await service.execute({ query: { limit, page, search, sort } });

	return reply.send(drinks);
};
