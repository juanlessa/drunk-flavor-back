import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUserService } from './getUser.container';
import { GetUserSchemaReqParams } from './getUser.dtos';
import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';

export const getUserController: Controller<{ Params: GetUserSchemaReqParams }> = async (request, reply) => {
	const { id } = request.params;

	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveGetUserService();

	const user = await service.execute({
		id,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.send(user);
};
