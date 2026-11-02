import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveRevokeUserSessionsService } from './revokeUserSessions.container';
import { RevokeUserSessionsReqBody, RevokeUserSessionsReqParams } from './revokeUserSessions.dtos';

export const revokeUserSessionsController: Controller<{
	Params: RevokeUserSessionsReqParams;
	Body: RevokeUserSessionsReqBody;
}> = async (request, reply) => {
	const service = resolveRevokeUserSessionsService();
	await service.execute({
		id: request.params.id,
		reason: request.body.reason,
		actor: {
			id: request.user.id,
			role: request.user.role,
			sessionVersion: request.user.sessionVersion,
		},
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
