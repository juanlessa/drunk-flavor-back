import { AppError, TooManyRequestsError, ForbiddenError } from '@/shared/error/error.lib';
import { FastifyRequest } from 'fastify';

type RateLimitErrorContext = {
	ban: boolean;
	after: string;
};

export const errorResponseBuilder = (_request: FastifyRequest, context: RateLimitErrorContext): AppError =>
	context.ban
		? new ForbiddenError('apiResponses.auth.tooManyRequests', {
				path: 'RateLimit.ban',
				cause: `rate limit ban reached (retry in ${context.after})`,
			})
		: new TooManyRequestsError('apiResponses.auth.tooManyRequests', {
				path: 'RateLimit.exceeded',
				cause: `rate limit exceeded (retry in ${context.after})`,
			});
