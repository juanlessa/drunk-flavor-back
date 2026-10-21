import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUnitService } from './getUnit.container';
import { GetUnitReqParams } from './getUnit.dtos';

export const getUnitController: Controller<{ Params: GetUnitReqParams }> = async (request, reply) => {
	const unit = await resolveGetUnitService().execute(request.params);
	return reply.send(unit);
};
