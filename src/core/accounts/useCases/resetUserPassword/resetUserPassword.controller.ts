import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { ResetUserPasswordReqBody } from './resetUserPassword.dtos';
import { resolveResetUserPasswordService } from './resetUserPassword.container';

export const resetUserPasswordController: Controller = async (request, reply) => {
	const { email } = request.body as ResetUserPasswordReqBody;

	const service = resolveResetUserPasswordService();

	await service.execute({ email });

	return reply.status(HTTP_STATUS.no_content).send();
};
