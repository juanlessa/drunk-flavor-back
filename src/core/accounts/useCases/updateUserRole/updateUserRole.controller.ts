import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UpdateUserRoleReqBody } from './updateUserRole.dtos';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveUpdateUserRoleService } from './updateUserRole.container';

export const updateUserRoleController: Controller<{ Body: UpdateUserRoleReqBody }> = async (request, reply) => {
	const { user_id, role } = request.body;

	const service = resolveUpdateUserRoleService();

	await service.execute({ user_id, role });

	return reply.status(HTTP_STATUS.no_content).send();
};
