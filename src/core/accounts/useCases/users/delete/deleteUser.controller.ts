import { resolveDeleteUserService } from './deleteUser.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { DeleteUserReqBody } from './deleteUser.dtos';
import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';

export const deleteUserController: Controller<{ Body: DeleteUserReqBody }> = async (request, reply) => {
	const { id } = request.body;

	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveDeleteUserService();

	await service.execute({
		id,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
