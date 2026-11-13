import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { signOut } from '@/infrastructure/fastify/middlewares/signOut';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveAcceptOwnershipTransferService } from './acceptOwnershipTransfer.container';
import { AcceptOwnershipTransferReqBody } from './acceptOwnershipTransfer.dtos';

export const acceptOwnershipTransferController: Controller<{ Body: AcceptOwnershipTransferReqBody }> = async (
	request,
	reply,
) => {
	const { token } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveAcceptOwnershipTransferService();
	await service.execute({
		token,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});
	await signOut(request, reply);
	return reply.status(HTTP_STATUS.no_content).send();
};
