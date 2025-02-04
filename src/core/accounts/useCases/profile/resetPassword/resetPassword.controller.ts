import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { ResetPasswordReqBody } from './resetPassword.dtos';
import { resolveResetPasswordService } from './resetPassword.container';

export const resetPasswordController: Controller<{ Body: ResetPasswordReqBody }> = async (request, reply) => {
	const { token, password } = request.body;

	const service = resolveResetPasswordService();

	await service.execute({ token, password });

	return reply.status(HTTP_STATUS.no_content).send();
};
