import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListCategoriesWithAuthorshipService } from './listCategoriesWithAuthorship.container';
import { ListCategoriesWithAuthorshipReqQuery } from './listCategoriesWithAuthorship.dtos';

export const listCategoriesWithAuthorshipController: Controller<{
	Querystring: ListCategoriesWithAuthorshipReqQuery;
}> = async (request, reply) => {
	const { limit, page, search, sort } = request.query;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveListCategoriesWithAuthorshipService();
	const categories = await service.execute({
		query: { limit, page, search, sort },
		actor,
	});
	return reply.send(categories);
};
