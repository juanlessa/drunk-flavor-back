import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateCategoryService } from './createCategory.container';
import { CreateCategoryReqBody } from './createCategory.dtos';

export const createCategoryController: Controller<{ Body: CreateCategoryReqBody }> = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	await resolveCreateCategoryService().execute({ ...request.body, actor });
	return reply.status(HTTP_STATUS.created).send();
};
