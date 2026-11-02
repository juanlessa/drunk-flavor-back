import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import {
	logReauthenticationFailed,
	logReauthenticationSucceeded,
} from '@/infrastructure/fastify/helpers/reauthentication.helpers';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { resolveReauthenticatePasswordService } from './reauthenticatePassword.container';
import { ReauthenticatePasswordReqBody } from './reauthenticatePassword.dtos';

export const reauthenticatePasswordController: Controller<{ Body: ReauthenticatePasswordReqBody }> = async (
	request,
	reply,
) => {
	const session = request.session.get(AUTH_SESSION);
	if (!session) {
		throw new UnauthorizedError('apiResponses.profile.recentAuthenticationRequired', {
			path: 'ReauthenticatePassword.controller',
			cause: 'Authenticated session is missing',
		});
	}

	try {
		const result = await resolveReauthenticatePasswordService().execute({
			userId: request.user.id,
			password: request.body.password,
		});
		request.session.set(AUTH_SESSION, {
			...session,
			reauthenticatedAt: result.authenticatedAt.toISOString(),
			reauthenticationMethod: result.method,
		});
		logReauthenticationSucceeded(request, result.method);
	} catch (error) {
		logReauthenticationFailed(request, 'password', error);
		throw error;
	}

	return reply.status(HTTP_STATUS.no_content).send();
};
