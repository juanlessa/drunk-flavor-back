import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveSuspendUserService } from './suspendUser.container';
import { SuspendUserReqBody, SuspendUserReqParam } from './suspendUser.dtos';

export const suspendUserController: Controller<{
	Params: SuspendUserReqParam;
	Body: SuspendUserReqBody;
}> = async (request, reply) => {
	const { id } = request.params;
	const { reason } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveSuspendUserService();
	await service.execute({
		id,
		reason,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
