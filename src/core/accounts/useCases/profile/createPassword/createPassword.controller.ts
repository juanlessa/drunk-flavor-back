import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { rotateAuthenticationSession } from '@/infrastructure/fastify/helpers/authSession.helpers';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreatePasswordService } from './createPassword.container';
import { CreatePasswordReqBody } from './createPassword.dtos';

export const createPasswordController: Controller<{ Body: CreatePasswordReqBody }> = async (request, reply) => {
	const { user } = await resolveCreatePasswordService().execute({
		userId: request.user.id,
		password: request.body.password,
	});
	await rotateAuthenticationSession(request, reply, user);

	return reply.status(HTTP_STATUS.no_content).send();
};
