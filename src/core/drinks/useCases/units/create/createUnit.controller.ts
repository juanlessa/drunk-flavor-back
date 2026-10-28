import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateUnitService } from './createUnit.container';
import { CreateUnitReqBody } from './createUnit.dtos';

export const createUnitController: Controller<{ Body: CreateUnitReqBody }> = async (request, reply) => {
	await resolveCreateUnitService().execute(request.body);
	return reply.status(HTTP_STATUS.created).send();
};
