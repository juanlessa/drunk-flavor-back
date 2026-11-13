import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateCategoryService } from './updateCategory.container';
import { UpdateCategoryReqBody } from './updateCategory.dtos';

export const updateCategoryController: Controller<{ Body: UpdateCategoryReqBody }> = async (request, reply) => {
	const { id, translations, isAlcoholic } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveUpdateCategoryService();
	await service.execute({ id, translations, isAlcoholic, actor });
	return reply.status(HTTP_STATUS.no_content).send();
};
