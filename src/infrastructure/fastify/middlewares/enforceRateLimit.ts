import { ForbiddenError, TooManyRequestsError } from '@/shared/error/error.lib';
import { PreHandler } from '../types/fastify.types';

/**
 * Route-agnostic rate-limit enforcement — a pure Fastify hook.
 *
 * It reads the per-route policy the route itself declared in its `config`
 * (`request.routeOptions.config.rateLimitPolicy`), so it needs no closure,
 * factory or central registry. Routes with no policy are passed through.
 *
 * It peeks the limiter (NON-mutating, `{ increment: false }`) and blocks only
 * when the window is actually exceeded (429) or the ban threshold is crossed
 * (403). NOTE: `@fastify/rate-limit` sets `isAllowed: true` ONLY for allow-list
 * hits; every normal in-limit request returns `isAllowed: false` with
 * `isExceeded: false`, so the decision must be driven by `isExceeded`/`isBanned`,
 * not by `isAllowed`. Both rejections carry `Retry-After` and flow through the
 * global errorHandler as `{ ok, localeKey, message }`.
 *
 * The name describes the responsibility, not the lifecycle slot: today it is
 * attached as `preHandler: [enforceRateLimit]`.
 */
export const enforceRateLimit: PreHandler = async (request, reply) => {
	const policy = request.routeOptions.config.rateLimitPolicy;
	if (policy === undefined) {
		return;
	}

	const status = await policy.limiter(request, { increment: false });

	// Allow-listed requests short-circuit as allowed; nothing to enforce.
	if (status.isAllowed) {
		return;
	}

	// In-limit requests are not exceeded/banned: let them through.
	if (!status.isExceeded && !status.isBanned) {
		return;
	}

	reply.header('retry-after', status.ttlInSeconds);

	if (status.isBanned) {
		throw new ForbiddenError('apiResponses.auth.tooManyRequests', {
			path: 'enforceRateLimit.ban',
			cause: 'rate limit ban reached',
		});
	}

	throw new TooManyRequestsError('apiResponses.auth.tooManyRequests', {
		path: 'enforceRateLimit.exceeded',
		cause: 'rate limit exceeded',
	});
};
