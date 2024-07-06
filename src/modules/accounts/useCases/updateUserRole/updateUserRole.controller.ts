import { HTTP_STATUS } from '@/shared/constants/httpStatus';
import { UpdateUserRoleReqBody } from './updateUserRole.dtos';
import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { resolveUpdateUserRoleService } from './updateUserRole.container';

export const updateUserRoleController: Controller = async (request, reply) => {
	const { user_id, role } = request.body as UpdateUserRoleReqBody;

	const service = resolveUpdateUserRoleService();

	await service.execute({ user_id, role });

	return reply.status(HTTP_STATUS.no_content).send();
};
