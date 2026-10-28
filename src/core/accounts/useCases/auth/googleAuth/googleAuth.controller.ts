import { resolveGoogleAuthService } from './googleAuth.container';
import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '@/infrastructure/fastify/constants/cookie.constants';
import { toJwtUserPayload } from '@/infrastructure/fastify/helpers/jwt.helpers';
import type { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { GoogleAuthReqBody } from './googleAuth.dtos';

export const googleAuthController: Controller<{ Body: GoogleAuthReqBody }> = async (request, reply) => {
	const { idToken } = request.body;

	const service = resolveGoogleAuthService();
	const { user } = await service.execute({ idToken });
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
		authenticationMethod: 'google',
	});
	reply.setCookie(AUTH_COOKIE, accessToken, AUTH_COOKIE_OPTIONS);

	return reply.send();
};
