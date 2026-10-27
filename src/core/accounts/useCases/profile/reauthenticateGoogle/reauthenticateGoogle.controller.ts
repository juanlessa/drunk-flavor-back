import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { resolveReauthenticateGoogleService } from './reauthenticateGoogle.container';
import { ReauthenticateGoogleReqBody } from './reauthenticateGoogle.dtos';

export const reauthenticateGoogleController: Controller<{ Body: ReauthenticateGoogleReqBody }> = async (
	request,
	reply,
) => {
	const session = request.session.get(AUTH_SESSION);
	if (!session) {
		throw new UnauthorizedError('apiResponses.profile.recentAuthenticationRequired', {
			path: 'ReauthenticateGoogle.controller',
			cause: 'Authenticated session is missing',
		});
	}

	const result = await resolveReauthenticateGoogleService().execute({
		userId: request.user.id,
		idToken: request.body.idToken,
	});

	request.session.set(AUTH_SESSION, {
		...session,
		reauthenticatedAt: result.authenticatedAt.toISOString(),
		reauthenticationMethod: result.method,
	});

	return reply.status(HTTP_STATUS.no_content).send();
};
