import { Controller } from '@/infra/fastify/types/fastify.types';
import { resolveGetCategoryService } from './getCategory.container';
import { GetCategoryReqParams } from './getCategory.dtos';

export const getCategoryController: Controller = async (request, reply) => {
	const { id } = request.params as GetCategoryReqParams;

	const service = resolveGetCategoryService();

	const category = await service.execute({ id });

	return reply.send(category);
};
