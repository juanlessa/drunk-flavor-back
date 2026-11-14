import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListUnitsService } from './listUnits.container';
import { ListUnitsReqQuery } from './listUnits.dtos';

export const listUnitsController: Controller<{ Querystring: ListUnitsReqQuery }> = async (request, reply) => {
	const { limit, page, search, sort } = request.query;
	const service = resolveListUnitsService();
	const units = await service.execute({ query: { limit, page, search, sort } });
	return reply.send(units);
};
