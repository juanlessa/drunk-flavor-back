import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveRequestOwnershipTransferService } from './requestOwnershipTransfer.container';
import { RequestOwnershipTransferReqBody } from './requestOwnershipTransfer.dtos';

export const requestOwnershipTransferController: Controller<{ Body: RequestOwnershipTransferReqBody }> = async (
	request,
	reply,
) => {
	const { targetUserId, reason } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveRequestOwnershipTransferService();
	await service.execute({
		targetUserId,
		reason,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});
	return reply.status(HTTP_STATUS.no_content).send();
};
