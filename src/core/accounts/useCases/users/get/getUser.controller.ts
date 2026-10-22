import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUserService } from './getUser.container';
import { GetUserSchemaReqParams } from './getUser.dtos';

export const getUserController: Controller<{ Params: GetUserSchemaReqParams }> = async (request, reply) => {
	const { id } = request.params;

	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveGetUserService();

	const user = await service.execute({ id, actor });

	return reply.send(user);
};
