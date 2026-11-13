import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveReactivateUserService } from './reactivateUser.container';
import { ReactivateUserReqBody, ReactivateUserReqParams } from './reactivateUser.dtos';

export const reactivateUserController: Controller<{
	Params: ReactivateUserReqParams;
	Body: ReactivateUserReqBody;
}> = async (request, reply) => {
	const { id } = request.params;
	const { reason } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveReactivateUserService();
	await service.execute({
		id,
		reason,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
