import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UpdateUserRoleReqBody } from './updateUserRole.dtos';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveUpdateUserRoleService } from './updateUserRole.container';
import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';

export const updateUserRoleController: Controller<{ Body: UpdateUserRoleReqBody }> = async (request, reply) => {
	const { user_id, role } = request.body;

	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveUpdateUserRoleService();

	await service.execute({
		userId: user_id,
		role,
		actor,
		administrativeContext: { origin: AdministrativeEventOrigins.api, requestId: request.id },
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
