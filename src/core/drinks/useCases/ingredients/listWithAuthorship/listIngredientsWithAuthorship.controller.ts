import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListIngredientsWithAuthorshipService } from './listIngredientsWithAuthorship.container';
import { ListIngredientsWithAuthorshipReqQuery } from './listIngredientsWithAuthorship.dtos';

export const listIngredientsWithAuthorshipController: Controller<{
	Querystring: ListIngredientsWithAuthorshipReqQuery;
}> = async (request, reply) => {
	const { limit, page, search, sort } = request.query;
	const actor = { id: request.user.id, role: request.user.role };
	const ingredients = await resolveListIngredientsWithAuthorshipService().execute({
		query: { limit, page, search, sort },
		actor,
	});
	return reply.send(ingredients);
};
