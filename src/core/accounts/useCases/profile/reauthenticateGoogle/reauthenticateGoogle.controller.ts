import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { resolveReauthenticateGoogleService } from './reauthenticateGoogle.container';
import { ReauthenticateGoogleReqBody } from './reauthenticateGoogle.dtos';
import {
	logReauthenticationFailed,
	logReauthenticationSucceeded,
} from '@/infrastructure/fastify/helpers/reauthentication.helpers';

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

	const { code } = request.body;
	const { id } = request.user;
	const service = resolveReauthenticateGoogleService();
	try {
		const result = await service.execute({ userId: id, authorizationCode: code });

		request.session.set(AUTH_SESSION, {
			...session,
			reauthenticatedAt: result.authenticatedAt.toISOString(),
			reauthenticationMethod: result.method,
		});
		logReauthenticationSucceeded(request, result.method);
	} catch (error) {
		logReauthenticationFailed(request, 'google', error);
		throw error;
	}

	return reply.status(HTTP_STATUS.no_content).send();
};
