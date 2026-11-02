import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateCategoryService } from './createCategory.container';
import { CreateCategoryReqBody } from './createCategory.dtos';

export const createCategoryController: Controller<{ Body: CreateCategoryReqBody }> = async (request, reply) => {
	await resolveCreateCategoryService().execute(request.body);
	return reply.status(HTTP_STATUS.created).send();
};
