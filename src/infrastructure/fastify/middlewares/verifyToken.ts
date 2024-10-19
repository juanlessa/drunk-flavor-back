import { Middleware } from '../types/fastify.types';

export const verifyToken: Middleware = async (request, _reply) => {
	// verify access token and throw any validation error
	await request.jwtVerify();
};
