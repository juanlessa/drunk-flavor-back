import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreatePasswordService } from './createPassword.container';
import { CreatePasswordReqBody } from './createPassword.dtos';

export const createPasswordController: Controller<{ Body: CreatePasswordReqBody }> = async (request, reply) => {
	await resolveCreatePasswordService().execute({
		userId: request.user.id,
		password: request.body.password,
	});

	const session = request.session.get(AUTH_SESSION);
	if (session) {
		const { reauthenticatedAt: _at, reauthenticationMethod: _method, ...remainingSession } = session;
		request.session.set(AUTH_SESSION, remainingSession);
	}

	return reply.status(HTTP_STATUS.no_content).send();
};
