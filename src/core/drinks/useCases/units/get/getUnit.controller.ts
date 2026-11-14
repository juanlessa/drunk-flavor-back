import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUnitService } from './getUnit.container';
import { GetUnitReqParam } from './getUnit.dtos';

export const getUnitController: Controller<{ Params: GetUnitReqParam }> = async (request, reply) => {
	const { id } = request.params;
	const service = resolveGetUnitService();
	const unit = await service.execute({ id });
	return reply.send(unit);
};
