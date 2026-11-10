import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveDeleteUnitService } from './deleteUnit.container';
import { DeleteUnitReqBody } from './deleteUnit.dtos';

export const deleteUnitController: Controller<{ Body: DeleteUnitReqBody }> = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	await resolveDeleteUnitService().execute({ ...request.body, actor });
	return reply.status(HTTP_STATUS.no_content).send();
};
