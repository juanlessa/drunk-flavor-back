import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListUsersService } from './listUsers.container';
import { ListUsersReqQuery } from './listUsers.dtos';
import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';

export const listUsersController: Controller<{ Querystring: ListUsersReqQuery }> = async (request, reply) => {
	const { limit, page, search, sort } = request.query;

	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveListUsersService();

	const users = await service.execute({
		query: { page, limit, search, sort },
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.send(users);
};
