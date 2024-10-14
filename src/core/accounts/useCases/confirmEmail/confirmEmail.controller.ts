import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { ConfirmEmailReqBody } from './confirmEmail.dtos';
import { resolveConfirmEmailService } from './confirmEmail.container';

export const confirmEmailController: Controller = async (request, reply) => {
	const { token } = request.body as ConfirmEmailReqBody;

	const service = resolveConfirmEmailService();

	await service.execute({ token });

	return reply.status(HTTP_STATUS.no_content).send();
};
