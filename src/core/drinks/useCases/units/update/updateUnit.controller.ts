import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateUnitService } from './updateUnit.container';
import { UpdateUnitReqBody } from './updateUnit.dtos';

export const updateUnitController: Controller<{ Body: UpdateUnitReqBody }> = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	await resolveUpdateUnitService().execute({ ...request.body, actor });
	return reply.status(HTTP_STATUS.no_content).send();
};
