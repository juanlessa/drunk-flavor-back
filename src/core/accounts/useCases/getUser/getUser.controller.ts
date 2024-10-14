import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetUserService } from './getUser.container';
import { GetUserSchemaReqParams } from './getUser.dtos';

export const getUserController: Controller = async (request, reply) => {
	const { id } = request.params as GetUserSchemaReqParams;

	const service = resolveGetUserService();

	const user = await service.execute({ id });

	return reply.send(user);
};
