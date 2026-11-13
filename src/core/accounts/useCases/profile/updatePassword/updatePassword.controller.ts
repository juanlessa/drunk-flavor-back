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
	const { currentPassword, newPassword } = request.body;
	const { id } = request.user;
	const service = resolveUpdatePasswordService();
	try {
		const { user } = await service.execute({ id, currentPassword, newPassword });
		logReauthenticationSucceeded(request, 'password');
		await rotateAuthenticationSession(request, reply, user);
	} catch (error) {
		logReauthenticationFailed(request, 'password', error);
		throw error;
	}

	return reply.status(HTTP_STATUS.no_content).send();
};
