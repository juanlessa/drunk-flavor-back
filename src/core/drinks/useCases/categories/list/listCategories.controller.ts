import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListCategoriesService } from './listCategories.container';
import { ListCategoriesReqQuery } from './listCategories.dtos';

export const listCategoriesController: Controller<{ Querystring: ListCategoriesReqQuery }> = async (request, reply) => {
	const { limit, page, search, sort } = request.query;

	const service = resolveListCategoriesService();

	const categories = await service.execute({ query: { page, limit, search, sort } });

	return reply.send(categories);
};
