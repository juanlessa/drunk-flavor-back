import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetPendingOwnershipTransferService } from './getPendingOwnershipTransfer.container';

export const getPendingOwnershipTransferController: Controller = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveGetPendingOwnershipTransferService();
	const pending = await service.execute({ actor });
	return reply.send(pending);
};
