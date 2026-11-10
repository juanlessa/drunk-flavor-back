import { rotateAuthenticationSession } from '@/infrastructure/fastify/helpers/authSession.helpers';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUnlinkGoogleIdentityService } from './unlinkGoogleIdentity.container';

export const unlinkGoogleIdentityController: Controller = async (request, reply) => {
	const { user } = await resolveUnlinkGoogleIdentityService().execute({ userId: request.user.id });
	await rotateAuthenticationSession(request, reply, user);
	return reply.status(HTTP_STATUS.no_content).send();
};
