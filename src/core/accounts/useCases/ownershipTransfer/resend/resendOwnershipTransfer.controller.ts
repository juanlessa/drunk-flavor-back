import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveResendOwnershipTransferService } from './resendOwnershipTransfer.container';

export const resendOwnershipTransferController: Controller = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveResendOwnershipTransferService();
	await service.execute({
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});
	return reply.status(HTTP_STATUS.no_content).send();
};
