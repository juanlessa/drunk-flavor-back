import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateCategoryService } from './updateCategory.container';
import { UpdateCategoryReqBody } from './updateCategory.dtos';

export const updateCategoryController: Controller<{ Body: UpdateCategoryReqBody }> = async (request, reply) => {
	await resolveUpdateCategoryService().execute(request.body);
	return reply.status(HTTP_STATUS.no_content).send();
};
