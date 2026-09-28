import { resolveSigninService } from './signin.container';
import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '@/infrastructure/fastify/constants/cookie.constants';
import type { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { SigninReqBody } from './signin.dtos';

export const signinController: Controller<{ Body: SigninReqBody }> = async (request, reply) => {
	const { password, email } = request.body;

	const service = resolveSigninService();

	const { user } = await service.execute({
		password,
		email,
	});

	const accessToken = await reply.jwtSign({ role: user.role }, { sign: { sub: user.id } });
	const refreshToken = await reply.sessionJwtSign({}, { sign: { sub: user.id } });

	request.session.set(AUTH_SESSION, {
		refreshToken,
		userId: user.id,
		userRole: user.role,
	});
	reply.setCookie(AUTH_COOKIE, accessToken, AUTH_COOKIE_OPTIONS);

	return reply.send();
};
