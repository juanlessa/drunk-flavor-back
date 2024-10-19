import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveRefreshTokenService } from './refreshToken.container';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '@/infrastructure/fastify/constants/cookie.constants';

export const refreshTokenController: Controller = async (request, reply) => {
	try {
		await request.sessionJwtVerify();
	} catch (error) {
		request.session.delete();
		reply.clearCookie(AUTH_COOKIE);
		throw error;
	}

	const { id: user_id } = request.user;

	const service = resolveRefreshTokenService();

	const user = await service.execute({ user_id });

	const accessToken = await reply.jwtSign({ role: user.role }, { sign: { sub: user._id.toString() } });

	reply.setCookie(AUTH_COOKIE, accessToken, AUTH_COOKIE_OPTIONS);

	return reply.send();
};
