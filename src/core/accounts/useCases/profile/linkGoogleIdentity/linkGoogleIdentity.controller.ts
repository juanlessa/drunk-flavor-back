import { rotateAuthenticationSession } from '@/infrastructure/fastify/helpers/authSession.helpers';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveLinkGoogleIdentityService } from './linkGoogleIdentity.container';
import { LinkGoogleIdentityReqBody } from './linkGoogleIdentity.dtos';

export const linkGoogleIdentityController: Controller<{ Body: LinkGoogleIdentityReqBody }> = async (request, reply) => {
	const { user } = await resolveLinkGoogleIdentityService().execute({
		userId: request.user.id,
		idToken: request.body.idToken,
	});
	await rotateAuthenticationSession(request, reply, user);

	return reply.status(HTTP_STATUS.no_content).send();
};
