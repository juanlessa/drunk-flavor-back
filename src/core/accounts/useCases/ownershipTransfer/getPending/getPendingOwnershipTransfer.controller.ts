import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetPendingOwnershipTransferService } from './getPendingOwnershipTransfer.container';

export const getPendingOwnershipTransferController: Controller = async (request, reply) => {
	const pending = await resolveGetPendingOwnershipTransferService().execute({
		actor: { id: request.user.id, role: request.user.role },
	});
	return reply.send(pending);
};
