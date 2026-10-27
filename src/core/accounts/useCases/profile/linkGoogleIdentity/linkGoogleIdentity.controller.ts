import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveLinkGoogleIdentityService } from './linkGoogleIdentity.container';
import { LinkGoogleIdentityReqBody } from './linkGoogleIdentity.dtos';

export const linkGoogleIdentityController: Controller<{ Body: LinkGoogleIdentityReqBody }> = async (request, reply) => {
	await resolveLinkGoogleIdentityService().execute({
		userId: request.user.id,
		currentPassword: request.body.currentPassword,
		idToken: request.body.idToken,
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
