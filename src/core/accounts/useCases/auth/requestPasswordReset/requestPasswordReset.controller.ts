import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { RequestPasswordResetReqBody } from './requestPasswordReset.dtos';
import { resolveRequestPasswordResetService } from './requestPasswordReset.container';

export const requestPasswordResetController: Controller<{ Body: RequestPasswordResetReqBody }> = async (
	request,
	reply,
) => {
	const { email } = request.body;

	const service = resolveRequestPasswordResetService();

	await service.execute({ email });

	return reply.status(HTTP_STATUS.no_content).send();
};
