import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveCancelOwnershipTransferService } from './cancelOwnershipTransfer.container';

export const cancelOwnershipTransferController: Controller = async (request, reply) => {
	await resolveCancelOwnershipTransferService().execute({
		actor: { id: request.user.id, role: request.user.role },
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});
	return reply.status(HTTP_STATUS.no_content).send();
};
