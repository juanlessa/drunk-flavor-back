import 'fastify';
import type { FastifyRequest } from 'fastify';

/**
 * The limiter callable produced by `fastify.createRateLimit(...)`. Accepts an
 * optional `{ increment }` flag: `false` peeks the current status without
 * consuming a request; omitting it (or `true`) consumes one.
 */
export type RateLimiter = (request: FastifyRequest, options?: { increment?: boolean }) => Promise<RateLimitStatus>;

/**
 * Discriminated status returned by `createRateLimit`. When the request is
 * allowed only `isAllowed` is present; when blocked, the exceed/ban/ttl fields
 * are available. The `isAllowed` discriminant narrows the blocked branch.
 */
export type RateLimitStatus =
	{ isAllowed: true } | { isAllowed: false; isExceeded: boolean; isBanned: boolean; ttlInSeconds: number };

/**
 * Per-route rate-limit policy, declared in the route's own `config` and read by
 * the hooks at runtime from `request.routeOptions.config.rateLimit`. This keeps
 * the hooks pure and route-agnostic: the behavior lives on each route, not in a
 * central registry or a closure.
 */
export interface RouteRateLimitPolicy {
	/** Limiter guarding this route (peeked in preHandler, consumed in onError). */
	limiter: RateLimiter;
	/**
	 * Decides, from the thrown error, whether a failure should consume a unit.
	 * Omitting it counts every failure. Returning false (e.g. for an already
	 * rate-limited 429/403, or a non-punishable domain error) skips counting.
	 */
	shouldCountFailure?: (error: unknown) => boolean;
}

declare module 'fastify' {
	interface FastifyContextConfig {
		// Named `rateLimitPolicy` (not `rateLimit`) to avoid colliding with the
		// `@fastify/rate-limit` plugin's own `config.rateLimit` option.
		rateLimitPolicy?: RouteRateLimitPolicy;
	}
}
