import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { resolveCreateCategoryService } from './createCategory.container';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';
import { CreateCategoryReqBody } from './createCategory.dtos';

export const createCategoryController: Controller = async (request, reply) => {
	const { translations } = request.body as CreateCategoryReqBody;

	const service = resolveCreateCategoryService();

	await service.execute({ translations });

	return reply.status(HTTP_STATUS.created).send();
};