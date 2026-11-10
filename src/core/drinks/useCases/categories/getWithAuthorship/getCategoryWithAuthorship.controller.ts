import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetCategoryWithAuthorshipService } from './getCategoryWithAuthorship.container';
import { GetCategoryWithAuthorshipReqParams } from './getCategoryWithAuthorship.dtos';

export const getCategoryWithAuthorshipController: Controller<{ Params: GetCategoryWithAuthorshipReqParams }> = async (
	request,
	reply,
) => {
	const category = await resolveGetCategoryWithAuthorshipService().execute(request.params);
	return reply.send(category);
};
