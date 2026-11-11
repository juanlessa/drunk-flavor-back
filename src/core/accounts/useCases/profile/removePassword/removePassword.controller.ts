import { rotateAuthenticationSession } from '@/infrastructure/fastify/helpers/authSession.helpers';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveRemovePasswordService } from './removePassword.container';

export const removePasswordController: Controller = async (request, reply) => {
	const { user } = await resolveRemovePasswordService().execute({ userId: request.user.id });
	await rotateAuthenticationSession(request, reply, user);
	return reply.status(HTTP_STATUS.no_content).send();
};
