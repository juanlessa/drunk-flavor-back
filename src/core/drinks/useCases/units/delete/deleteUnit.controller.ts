import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveDeleteUnitService } from './deleteUnit.container';
import { DeleteUnitReqBody } from './deleteUnit.dtos';

export const deleteUnitController: Controller<{ Body: DeleteUnitReqBody }> = async (request, reply) => {
	const { id } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveDeleteUnitService();
	await service.execute({ id, actor });
	return reply.status(HTTP_STATUS.no_content).send();
};
