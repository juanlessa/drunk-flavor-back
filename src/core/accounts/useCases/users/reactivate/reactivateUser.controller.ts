import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveReactivateUserService } from './reactivateUser.container';
import { ReactivateUserReqBody, ReactivateUserReqParams } from './reactivateUser.dtos';

export const reactivateUserController: Controller<{
	Params: ReactivateUserReqParams;
	Body: ReactivateUserReqBody;
}> = async (request, reply) => {
	const service = resolveReactivateUserService();
	await service.execute({
		id: request.params.id,
		reason: request.body.reason,
		actor: { id: request.user.id, role: request.user.role },
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
