import { Middleware } from '../types/fastify.types';

export const signOut: Middleware = async (request, reply) => {
	request.session.delete();
	void reply.clearCookie('Authorization');
	return { ok: true };
};
