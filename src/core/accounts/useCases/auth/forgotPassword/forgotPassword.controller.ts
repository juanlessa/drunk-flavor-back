import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { ForgotPasswordReqBody } from './forgotPassword.dtos';
import { resolveForgotPasswordService } from './forgotPassword.container';

export const forgotPasswordController: Controller<{ Body: ForgotPasswordReqBody }> = async (request, reply) => {
	const { email } = request.body;

	const service = resolveForgotPasswordService();

	await service.execute({ email });

	return reply.status(HTTP_STATUS.no_content).send();
};
