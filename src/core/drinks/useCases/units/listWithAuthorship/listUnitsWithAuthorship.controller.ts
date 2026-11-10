import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListUnitsWithAuthorshipService } from './listUnitsWithAuthorship.container';
import { ListUnitsWithAuthorshipReqQuery } from './listUnitsWithAuthorship.dtos';

export const listUnitsWithAuthorshipController: Controller<{ Querystring: ListUnitsWithAuthorshipReqQuery }> = async (
	request,
	reply,
) => {
	const { limit, page, search, sort } = request.query;
	const actor = { id: request.user.id, role: request.user.role };
	const units = await resolveListUnitsWithAuthorshipService().execute({
		query: { limit, page, search, sort },
		actor,
	});
	return reply.send(units);
};
