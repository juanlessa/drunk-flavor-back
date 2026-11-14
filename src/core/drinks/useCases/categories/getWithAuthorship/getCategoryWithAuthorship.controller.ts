import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetCategoryWithAuthorshipService } from './getCategoryWithAuthorship.container';
import { GetCategoryWithAuthorshipReqParam } from './getCategoryWithAuthorship.dtos';

export const getCategoryWithAuthorshipController: Controller<{ Params: GetCategoryWithAuthorshipReqParam }> = async (
	request,
	reply,
) => {
	const { id } = request.params;
	const service = resolveGetCategoryWithAuthorshipService();
	const category = await service.execute({ id });
	return reply.send(category);
};
