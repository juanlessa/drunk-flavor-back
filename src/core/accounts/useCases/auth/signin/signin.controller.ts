import { resolveSigninService } from './signin.container';
import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '@/infrastructure/fastify/constants/cookie.constants';
import { toJwtUserPayload } from '@/infrastructure/fastify/helpers/jwt.helpers';
import type { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { SigninReqBody } from './signin.dtos';

export const signinController: Controller<{ Body: SigninReqBody }> = async (request, reply) => {
	const { password, email } = request.body;

	const service = resolveSigninService();
	const { user } = await service.execute({ password, email });
	const tokenPayload = toJwtUserPayload(user);
	const accessToken = await reply.jwtSign(tokenPayload, { sign: { sub: user.id } });
	const refreshToken = await reply.sessionJwtSign(tokenPayload, { sign: { sub: user.id } });

	request.session.set(AUTH_SESSION, {
		refreshToken,
		userId: user.id,
		userRole: user.role,
		userStatus: user.status,
		sessionVersion: user.sessionVersion,
		authenticatedAt: new Date().toISOString(),
		authenticationMethod: 'password',
	});
	reply.setCookie(AUTH_COOKIE, accessToken, AUTH_COOKIE_OPTIONS);

	return reply.send();
};
