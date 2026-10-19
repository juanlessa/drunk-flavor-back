import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import type {
	IRateLimitStore,
	RateLimitCallback,
	RateLimitRouteOptions,
} from '../fastify/rateLimitStore/IRateLimit.store';
import { RATE_LIMIT_KEY_PREFIX } from '../fastify/constants/rateLimit.constants';

export class RedisRateLimitStore implements IRateLimitStore {
	private readonly continueExceeding: boolean;
	private readonly prefix: string;

	constructor(options: RateLimitRouteOptions = {}, prefix: string = RATE_LIMIT_KEY_PREFIX) {
		this.continueExceeding = options.continueExceeding ?? false;
		this.prefix = prefix;
	}

	private get client() {
		return RedisConnection.Instance.client;
	}

	child(routeOptions: RateLimitRouteOptions = {}): RedisRateLimitStore {
		const { method, url } = routeOptions.routeInfo ?? {};
		return new RedisRateLimitStore(routeOptions, `${this.prefix}${method}${url}-`);
	}

	incr(key: string, callback: RateLimitCallback, timeWindow: number, max: number): void {
		const fullKey = this.prefix + key;

		this.client
			.multi()
			.incr(fullKey)
			.pTTL(fullKey)
			.exec()
			.then(async (replies) => {
				const current = Number(replies[0] ?? 0);
				const pttl = Number(replies[1] ?? -1);

				if (current === 1 || (this.continueExceeding && current > max)) {
					await this.client.pExpire(fullKey, timeWindow);
					callback(null, { current, ttl: timeWindow });
					return;
				}

				callback(null, { current, ttl: pttl > 0 ? pttl : timeWindow });
			})
			.catch((error: unknown) => callback(error as Error, null));
	}

	read(key: string, callback: RateLimitCallback): void {
		const fullKey = this.prefix + key;

		this.client
			.get(fullKey)
			.then(async (value) => {
				if (value === null) {
					callback(null, { current: 0, ttl: 0 });
					return;
				}
				const pttl = await this.client.pTTL(fullKey);
				callback(null, { current: Number(value), ttl: pttl > 0 ? pttl : 0 });
			})
			.catch((error: unknown) => callback(error as Error, null));
	}

	reset(): Promise<number> {
		return RedisConnection.Instance.deleteKeysByPattern(`${this.prefix}*`);
	}
}
