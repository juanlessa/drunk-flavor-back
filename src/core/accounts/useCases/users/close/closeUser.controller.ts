import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveCloseUserService } from './closeUser.container';
import { CloseUserReqBody, CloseUserReqParams } from './closeUser.dtos';

export const closeUserController: Controller<{
	Params: CloseUserReqParams;
	Body: CloseUserReqBody;
}> = async (request, reply) => {
	const service = resolveCloseUserService();
	await service.execute({
		id: request.params.id,
		reason: request.body.reason,
		actor: { id: request.user.id, role: request.user.role },
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
