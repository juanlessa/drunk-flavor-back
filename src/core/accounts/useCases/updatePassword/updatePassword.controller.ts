import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { UpdatePasswordReqBody } from './updatePassword.dtos';
import { resolveUpdatePasswordService } from './updatePassword.container';

export const updatePasswordController: Controller<{ Body: UpdatePasswordReqBody }> = async (request, reply) => {
	const { currentPassword, newPassword } = request.body;
	const { id } = request.user;

	const service = resolveUpdatePasswordService();

	await service.execute({ id, currentPassword, newPassword });

	return reply.status(HTTP_STATUS.no_content).send();
};
