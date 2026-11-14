import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUnitWithAuthorshipService } from './getUnitWithAuthorship.container';
import { GetUnitWithAuthorshipReqParam } from './getUnitWithAuthorship.dtos';

export const getUnitWithAuthorshipController: Controller<{ Params: GetUnitWithAuthorshipReqParam }> = async (
	request,
	reply,
) => {
	const { id } = request.params;
	const service = resolveGetUnitWithAuthorshipService();
	const unit = await service.execute({ id });
	return reply.send(unit);
};
