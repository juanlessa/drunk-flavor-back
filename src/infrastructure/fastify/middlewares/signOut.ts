import { AUTH_COOKIE } from '../constants/cookie.constants';
import { Middleware } from '../types/fastify.types';

export const signOut: Middleware = async (request, reply) => {
	request.session.delete();
	void reply.clearCookie(AUTH_COOKIE);
	return { ok: true };
};
