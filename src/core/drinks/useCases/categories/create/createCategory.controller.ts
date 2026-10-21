import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveCreateCategoryService } from './createCategory.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { CreateCategoryReqBody } from './createCategory.dtos';

export const createCategoryController: Controller<{ Body: CreateCategoryReqBody }> = async (request, reply) => {
	const { translations, is_alcoholic } = request.body;

	const service = resolveCreateCategoryService();

	await service.execute({ translations, is_alcoholic });

	return reply.status(HTTP_STATUS.created).send();
};
