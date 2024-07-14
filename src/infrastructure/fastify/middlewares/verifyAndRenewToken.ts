import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '../constants/cookie.constants';
import { Middleware } from '../types/fastify.types';
import { instanceOfFastifyJwtError, instanceOfJwtAuthorizationTokenExpiredError } from '../errors/fastifyJwtError';
import { signOut } from './signOut';

export const verifyAndRenewToken: Middleware = async (request, reply) => {
	// verify access token
	try {
		await request.jwtVerify();
		return;
	} catch (error) {
		if (!instanceOfJwtAuthorizationTokenExpiredError(error)) {
			void signOut(request, reply);
			throw error;
		}
	}

	// verify refresh token to renew expired access token
	try {
		await request.sessionJwtVerify();
	} catch (error) {
		if (instanceOfFastifyJwtError(error)) {
			void signOut(request, reply);
		}
		throw error;
	}

	// new access token
	const { id } = request.user;
	const newAccessToken = await reply.jwtSign({}, { sign: { sub: id } });
	reply.setCookie(AUTH_COOKIE, newAccessToken, AUTH_COOKIE_OPTIONS);
};
