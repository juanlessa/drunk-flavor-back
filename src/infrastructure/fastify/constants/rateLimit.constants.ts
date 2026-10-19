import type { FastifyPluginOptions } from 'fastify';
import { RateLimitStore } from '../rateLimitStore/index';
import { RATE_LIMIT_KEY_PREFIX } from '@/infrastructure/redis/RedisRateLimit.store';
import { errorResponseBuilder } from '../helpers/rateLimit.helpers';

export const RATE_LIMIT_OPTIONS: FastifyPluginOptions = {
	global: false,
	store: RateLimitStore,
	nameSpace: RATE_LIMIT_KEY_PREFIX,
	hook: 'preHandler',
	// If Redis is unreachable, fail open rather than blocking all auth traffic.
	skipOnError: true,
	errorResponseBuilder: errorResponseBuilder,
};
