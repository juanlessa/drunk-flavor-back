import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateUnitService } from './createUnit.container';
import { CreateUnitReqBody } from './createUnit.dtos';

export const createUnitController: Controller<{ Body: CreateUnitReqBody }> = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	await resolveCreateUnitService().execute({ ...request.body, actor });
	return reply.status(HTTP_STATUS.created).send();
};
