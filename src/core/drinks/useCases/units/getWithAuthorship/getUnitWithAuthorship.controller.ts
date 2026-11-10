import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUnitWithAuthorshipService } from './getUnitWithAuthorship.container';
import { GetUnitWithAuthorshipReqParams } from './getUnitWithAuthorship.dtos';

export const getUnitWithAuthorshipController: Controller<{ Params: GetUnitWithAuthorshipReqParams }> = async (
	request,
	reply,
) => {
	const unit = await resolveGetUnitWithAuthorshipService().execute(request.params);
	return reply.send(unit);
};
