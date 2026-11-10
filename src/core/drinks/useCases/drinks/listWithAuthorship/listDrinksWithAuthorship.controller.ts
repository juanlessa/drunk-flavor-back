import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListDrinksWithAuthorshipService } from './listDrinksWithAuthorship.container';
import { ListDrinksWithAuthorshipReqQuery } from './listDrinksWithAuthorship.dtos';

export const listDrinksWithAuthorshipController: Controller<{ Querystring: ListDrinksWithAuthorshipReqQuery }> = async (
	request,
	reply,
) => {
	const { limit, page, search, sort } = request.query;
	const actor = { id: request.user.id, role: request.user.role };
	const drinks = await resolveListDrinksWithAuthorshipService().execute({
		query: { limit, page, search, sort },
		actor,
	});
	return reply.send(drinks);
};
