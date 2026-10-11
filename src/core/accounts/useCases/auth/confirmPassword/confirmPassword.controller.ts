import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { ConfirmPasswordReqBody } from './confirmPassword.dtos';
import { resolveConfirmPasswordService } from './confirmPassword.container';

export const confirmPasswordController: Controller<{ Body: ConfirmPasswordReqBody }> = async (request, reply) => {
	const { token, password } = request.body;

	const service = resolveConfirmPasswordService();

	await service.execute({ token, password });

	return reply.status(HTTP_STATUS.no_content).send();
};
