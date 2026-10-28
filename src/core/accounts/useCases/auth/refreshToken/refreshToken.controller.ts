import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveRefreshTokenService } from './refreshToken.container';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '@/infrastructure/fastify/constants/cookie.constants';
import { AUTH_SESSION } from '@/infrastructure/fastify/constants/session.constants';
import { toJwtUserPayload } from '@/infrastructure/fastify/helpers/jwt.helpers';

export const refreshTokenController: Controller = async (request, reply) => {
	try {
		await request.sessionJwtVerify();
	} catch (error) {
		request.session.delete();
		reply.clearCookie(AUTH_COOKIE);
		throw error;
	}

	const service = resolveRefreshTokenService();
	const user = await service.execute({
		userId: request.user.id,
		sessionVersion: request.user.sessionVersion,
	});
	const tokenPayload = toJwtUserPayload(user);
	const accessToken = await reply.jwtSign(tokenPayload, { sign: { sub: user.id } });

	const session = request.session.get(AUTH_SESSION);
	if (session) {
		request.session.set(AUTH_SESSION, {
			...session,
			userRole: user.role,
			userStatus: user.status,
			sessionVersion: user.sessionVersion,
		});
	}
	reply.setCookie(AUTH_COOKIE, accessToken, AUTH_COOKIE_OPTIONS);

	return reply.send();
};
