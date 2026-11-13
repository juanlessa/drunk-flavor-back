import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateCategoryService } from './createCategory.container';
import { CreateCategoryReqBody } from './createCategory.dtos';

export const createCategoryController: Controller<{ Body: CreateCategoryReqBody }> = async (request, reply) => {
	const { translations, isAlcoholic } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveCreateCategoryService();
	await service.execute({ translations, isAlcoholic, actor });
	return reply.status(HTTP_STATUS.created).send();
};
