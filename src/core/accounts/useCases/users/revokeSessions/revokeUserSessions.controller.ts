import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveRevokeUserSessionsService } from './revokeUserSessions.container';
import { RevokeUserSessionsReqBody, RevokeUserSessionsReqParam } from './revokeUserSessions.dtos';

export const revokeUserSessionsController: Controller<{
	Params: RevokeUserSessionsReqParam;
	Body: RevokeUserSessionsReqBody;
}> = async (request, reply) => {
	const { id } = request.params;
	const { reason } = request.body;
	const actor = {
		id: request.user.id,
		role: request.user.role,
		sessionVersion: request.user.sessionVersion,
	};
	const service = resolveRevokeUserSessionsService();
	await service.execute({
		id,
		reason,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
