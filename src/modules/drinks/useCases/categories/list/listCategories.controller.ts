import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { resolveListCategoriesService } from './listCategories.container';

export const listCategoriesController: Controller = async (request, reply) => {
	const service = resolveListCategoriesService();

	const categories = await service.execute();

	return reply.send(categories);
};
