import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { resolveListCategoriesService } from './listCategories.container';
import { ListCategoriesReqQuery } from './listCategories.dtos';

export const listCategoriesController: Controller = async (request, reply) => {
	const { limit, page, search, sort } = request.query as ListCategoriesReqQuery;

	const service = resolveListCategoriesService();

	const categories = await service.execute({ query: { page, limit, search, sort } });

	return reply.send(categories);
};
