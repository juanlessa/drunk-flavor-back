import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { rotateAuthenticationSession } from '@/infrastructure/fastify/helpers/authSession.helpers';
import {
	logReauthenticationFailed,
	logReauthenticationSucceeded,
} from '@/infrastructure/fastify/helpers/reauthentication.helpers';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { UpdatePasswordReqBody } from './updatePassword.dtos';
import { resolveUpdatePasswordService } from './updatePassword.container';

export const updatePasswordController: Controller<{ Body: UpdatePasswordReqBody }> = async (request, reply) => {
	try {
		const { user } = await resolveUpdatePasswordService().execute({
			id: request.user.id,
			currentPassword: request.body.currentPassword,
			newPassword: request.body.newPassword,
		});
		logReauthenticationSucceeded(request, 'password');
		await rotateAuthenticationSession(request, reply, user);
	} catch (error) {
		logReauthenticationFailed(request, 'password', error);
		throw error;
	}

	return reply.status(HTTP_STATUS.no_content).send();
};
