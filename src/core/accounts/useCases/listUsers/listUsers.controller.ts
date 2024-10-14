import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListUsersService } from './listUsers.container';
import { ListUsersReqQuery } from './listUsers.dtos';

export const listUsersController: Controller = async (request, reply) => {
	const { limit, page, search, sort } = request.query as ListUsersReqQuery;

	const service = resolveListUsersService();

	const users = await service.execute({ query: { page, limit, search, sort } });

	return reply.send(users);
};
