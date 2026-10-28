import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveRequestOwnershipTransferService } from './requestOwnershipTransfer.container';
import { RequestOwnershipTransferReqBody } from './requestOwnershipTransfer.dtos';

export const requestOwnershipTransferController: Controller<{ Body: RequestOwnershipTransferReqBody }> = async (
	request,
	reply,
) => {
	await resolveRequestOwnershipTransferService().execute({
		targetUserId: request.body.target_user_id,
		reason: request.body.reason,
		actor: { id: request.user.id, role: request.user.role },
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});
	return reply.status(HTTP_STATUS.no_content).send();
};
