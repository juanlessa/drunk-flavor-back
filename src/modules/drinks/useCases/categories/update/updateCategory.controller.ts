import { Controller } from '@/infra/fastify/types/fastify.types';
import { resolveUpdateCategoryService } from './updateCategory.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UpdateCategoryReqBody } from './updateCategory.dtos';

export const updateCategoryController: Controller = async (request, reply) => {
	const { id, translations } = request.body as UpdateCategoryReqBody;

	const service = resolveUpdateCategoryService();

	await service.execute({ id, translations });

	return reply.status(HTTP_STATUS.no_content).send();
};
