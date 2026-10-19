import type { IRateLimitStore } from './IRateLimit.store';
import { RedisRateLimitStore } from '@/infrastructure/redis/RedisRateLimit.store';

export const RateLimitStore = RedisRateLimitStore;

const rateLimitStore: IRateLimitStore = new RateLimitStore();
export const resolveRateLimitStore = (): IRateLimitStore => rateLimitStore;
