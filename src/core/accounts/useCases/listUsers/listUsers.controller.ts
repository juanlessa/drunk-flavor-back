import { Controller } from '@/infra/fastify/types/fastify.types';
import { resolveListUsersService } from './listUsers.container';

export const listUsersController: Controller = async (request, reply) => {
	const { id: adminId } = request.user;

	const service = resolveListUsersService();

	const users = await service.execute(adminId);

	return reply.send(users);
};
