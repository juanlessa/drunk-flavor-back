import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateUnitService } from './updateUnit.container';
import { UpdateUnitReqBody } from './updateUnit.dtos';

export const updateUnitController: Controller<{ Body: UpdateUnitReqBody }> = async (request, reply) => {
	await resolveUpdateUnitService().execute(request.body);
	return reply.status(HTTP_STATUS.no_content).send();
};
