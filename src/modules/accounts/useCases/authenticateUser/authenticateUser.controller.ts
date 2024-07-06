import { resolveAuthenticateUserService } from './authenticateUser.container';
import { AUTH_SESSION } from '@/shared/infra/fastify/constants/session.constants';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '@/shared/infra/fastify/constants/cookie.constants';
import type { Controller } from '@/shared/infra/fastify/types/fastify.types';
import type { AuthenticateUserReqBody } from './authenticateUser.dtos';

export const authenticateUserController: Controller = async (request, reply) => {
	const { password, email } = request.body as AuthenticateUserReqBody;

	const service = resolveAuthenticateUserService();

	const { user } = await service.execute({
		password,
		email,
	});

	const accessToken = await reply.jwtSign({}, { sign: { sub: user.id } });
	const refreshToken = await reply.sessionJwtSign({}, { sign: { sub: user.id } });

	request.session.set(AUTH_SESSION, {
		refreshToken,
		userId: user.id,
		userRole: user.role,
	});
	reply.setCookie(AUTH_COOKIE, accessToken, AUTH_COOKIE_OPTIONS);

	return reply.send();
};
