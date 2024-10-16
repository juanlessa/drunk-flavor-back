import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { ListDrinksReqQuery } from './listDrinks.dtos';
import { resolveListDrinksService } from './listDrinks.container';

export const listDrinksController: Controller<{ Querystring: ListDrinksReqQuery }> = async (request, reply) => {
	const { limit, page, search, sort } = request.query;

	const service = resolveListDrinksService();

	const drinks = await service.execute({ query: { limit, page, search, sort } });

	return reply.send(drinks);
};
