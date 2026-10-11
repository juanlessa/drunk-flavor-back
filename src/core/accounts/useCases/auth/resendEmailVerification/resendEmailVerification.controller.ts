import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { ResendEmailVerificationReqBody } from './resendEmailVerification.dtos';
import { resolveResendEmailVerificationService } from './resendEmailVerification.container';

export const resendEmailVerificationController: Controller<{ Body: ResendEmailVerificationReqBody }> = async (
	request,
	reply,
) => {
	const { email } = request.body;

	const service = resolveResendEmailVerificationService();

	await service.execute({ email });

	return reply.status(HTTP_STATUS.no_content).send();
};
