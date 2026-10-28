import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';
import { signOut } from '@/infrastructure/fastify/middlewares/signOut';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveAcceptOwnershipTransferService } from './acceptOwnershipTransfer.container';
import { AcceptOwnershipTransferReqBody } from './acceptOwnershipTransfer.dtos';

export const acceptOwnershipTransferController: Controller<{ Body: AcceptOwnershipTransferReqBody }> = async (
	request,
	reply,
) => {
	await resolveAcceptOwnershipTransferService().execute({
		token: request.body.token,
		actor: { id: request.user.id, role: request.user.role },
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});
	await signOut(request, reply);
	return reply.status(HTTP_STATUS.no_content).send();
};
