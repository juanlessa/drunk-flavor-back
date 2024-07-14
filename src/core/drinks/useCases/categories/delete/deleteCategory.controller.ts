import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveDeleteCategoryService } from './deleteCategory.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { DeleteCategoryReqBody } from './deleteCategory.dtos';

export const deleteCategoryController: Controller = async (request, reply) => {
	const { id } = request.body as DeleteCategoryReqBody;

	const service = resolveDeleteCategoryService();

	await service.execute({ id });

	return reply.status(HTTP_STATUS.no_content).send();
};
