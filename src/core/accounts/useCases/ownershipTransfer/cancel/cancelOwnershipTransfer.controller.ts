import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveCancelOwnershipTransferService } from './cancelOwnershipTransfer.container';

export const cancelOwnershipTransferController: Controller = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveCancelOwnershipTransferService();
	await service.execute({
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});
	return reply.status(HTTP_STATUS.no_content).send();
};
