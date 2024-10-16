import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetCategoryService } from './getCategory.container';
import { GetCategoryReqParams } from './getCategory.dtos';

export const getCategoryController: Controller<{ Params: GetCategoryReqParams }> = async (request, reply) => {
	const { id } = request.params;

	const service = resolveGetCategoryService();

	const category = await service.execute({ id });

	return reply.send(category);
};
