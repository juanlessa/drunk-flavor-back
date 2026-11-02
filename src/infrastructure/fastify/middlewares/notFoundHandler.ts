import { NotFoundError } from '@/shared/error/error.lib';

/**
 * Fastify's default 404 body bypasses the error handler. Throwing here routes unknown routes
 * (and unsupported methods, which Fastify also treats as not found) through the standard error contract.
 */
export const notFoundHandler = async (): Promise<never> => {
	throw new NotFoundError('apiResponses.request.routeNotFound', { path: 'Fastify.routeNotFound' });
};
