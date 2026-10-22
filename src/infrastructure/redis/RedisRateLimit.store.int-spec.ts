import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { RATE_LIMIT_KEY_PREFIX, RedisRateLimitStore } from '@/infrastructure/redis/RedisRateLimit.store';
import type { IRateLimitStore } from '@/infrastructure/fastify/rateLimitStore/IRateLimit.store';

const TIME_WINDOW = 60_000;
const MAX = 5;

export type RateLimitResult = { current: number; ttl: number };

export const incr = (store: IRateLimitStore, key: string, timeWindow: number, max: number): Promise<RateLimitResult> =>
	new Promise<RateLimitResult>((resolve, reject) => {
		store.incr(
			key,
			(error, result) => {
				if (error || !result) {
					reject(error ?? new Error('Rate limit incr returned no result.'));
					return;
				}
				resolve(result);
			},
			timeWindow,
			max,
		);
	});

export const read = (store: IRateLimitStore, key: string): Promise<RateLimitResult> =>
	new Promise<RateLimitResult>((resolve, reject) => {
		store.read(key, (error, result) => {
			if (error || !result) {
				reject(error ?? new Error('Rate limit read returned no result.'));
				return;
			}
			resolve(result);
		});
	});

describe('RedisRateLimitStore (integration)', () => {
	beforeEach(async () => {
		await RedisConnection.Instance.flushCache();
	});

	afterEach(async () => {
		await RedisConnection.Instance.flushCache();
	});

	describe('incr', () => {
		it('starts at current 1 with a positive ttl within the window', async () => {
			const store = new RedisRateLimitStore();

			const result = await incr(store, 'client-1', TIME_WINDOW, MAX);

			expect(result.current).toBe(1);
			expect(result.ttl).toBeGreaterThan(0);
			expect(result.ttl).toBeLessThanOrEqual(TIME_WINDOW);
		});

		it('increments deterministically and preserves the window when continueExceeding is false', async () => {
			const store = new RedisRateLimitStore();

			const first = await incr(store, 'client-2', TIME_WINDOW, MAX);
			const second = await incr(store, 'client-2', TIME_WINDOW, MAX);
			const third = await incr(store, 'client-2', TIME_WINDOW, MAX);

			expect(first.current).toBe(1);
			expect(second.current).toBe(2);
			expect(third.current).toBe(3);

			// The window is only established on the first hit; later hits keep the
			// remaining ttl rather than resetting it to the full window.
			expect(second.ttl).toBeLessThanOrEqual(first.ttl);
			expect(third.ttl).toBeLessThanOrEqual(first.ttl);
		});

		it('refreshes the ttl once current exceeds max when continueExceeding is true', async () => {
			const store = new RedisRateLimitStore({ continueExceeding: true });

			// Drive current up to max; these establish/keep the original window.
			for (let attempt = 0; attempt < MAX; attempt += 1) {
				await incr(store, 'client-3', TIME_WINDOW, MAX);
			}

			// Let a deterministic, measurable amount of the window elapse via Redis
			// itself by shortening the key ttl, then exceed max and assert the ttl
			// was refreshed back to (near) the full window.
			const fullKey = `${RATE_LIMIT_KEY_PREFIX}client-3`;
			await RedisConnection.Instance.client.pExpire(fullKey, 1_000);

			const exceeded = await incr(store, 'client-3', TIME_WINDOW, MAX);

			expect(exceeded.current).toBe(MAX + 1);
			expect(exceeded.ttl).toBe(TIME_WINDOW);
			const refreshedPttl = await RedisConnection.Instance.client.pTTL(fullKey);
			expect(refreshedPttl).toBeGreaterThan(1_000);
		});
	});

	describe('read', () => {
		it('returns current 0 and ttl 0 for a missing key', async () => {
			const store = new RedisRateLimitStore();

			const result = await read(store, 'missing');

			expect(result).toEqual({ current: 0, ttl: 0 });
		});

		it('returns the current count and a positive ttl for an existing key', async () => {
			const store = new RedisRateLimitStore();
			await incr(store, 'client-4', TIME_WINDOW, MAX);
			await incr(store, 'client-4', TIME_WINDOW, MAX);

			const result = await read(store, 'client-4');

			expect(result.current).toBe(2);
			expect(result.ttl).toBeGreaterThan(0);
		});
	});

	describe('child', () => {
		it('namespaces keys beneath the prefix and isolates routes', async () => {
			const base = new RedisRateLimitStore();
			const routeA = base.child({ routeInfo: { method: 'POST', url: '/signin' } });
			const routeB = base.child({ routeInfo: { method: 'POST', url: '/signup' } });

			await incr(routeA, 'ip-1', TIME_WINDOW, MAX);
			await incr(routeA, 'ip-1', TIME_WINDOW, MAX);
			await incr(routeB, 'ip-1', TIME_WINDOW, MAX);

			const keys: string[] = [];
			for await (const key of RedisConnection.Instance.client.scanIterator({
				MATCH: `${RATE_LIMIT_KEY_PREFIX}*`,
			})) {
				keys.push(...(Array.isArray(key) ? key : [key]));
			}

			// Every rate-limit key lives under the shared prefix.
			expect(keys.every((key) => key.startsWith(RATE_LIMIT_KEY_PREFIX))).toBe(true);
			// The two routes produced distinct namespaced keys for the same client id.
			expect(keys).toContain(`${RATE_LIMIT_KEY_PREFIX}POST/signin-ip-1`);
			expect(keys).toContain(`${RATE_LIMIT_KEY_PREFIX}POST/signup-ip-1`);

			// Route counts are isolated from each other.
			expect((await read(routeA, 'ip-1')).current).toBe(2);
			expect((await read(routeB, 'ip-1')).current).toBe(1);
		});
	});

	describe('reset', () => {
		it('deletes only keys under its prefix and returns the deleted count', async () => {
			const store = new RedisRateLimitStore();
			await incr(store, 'client-5', TIME_WINDOW, MAX);
			await incr(store, 'client-6', TIME_WINDOW, MAX);

			// An unrelated key outside the rate-limit prefix must survive.
			await RedisConnection.Instance.client.set('unrelated:key', 'keep-me');

			const deleted = await store.reset();

			expect(deleted).toBe(2);
			expect(await RedisConnection.Instance.client.get('unrelated:key')).toBe('keep-me');
			expect((await read(store, 'client-5')).current).toBe(0);
			expect((await read(store, 'client-6')).current).toBe(0);
		});

		it('scopes reset to a child prefix without touching sibling routes', async () => {
			const base = new RedisRateLimitStore();
			const routeA = base.child({ routeInfo: { method: 'POST', url: '/signin' } });
			const routeB = base.child({ routeInfo: { method: 'POST', url: '/signup' } });

			await incr(routeA, 'ip-2', TIME_WINDOW, MAX);
			await incr(routeB, 'ip-2', TIME_WINDOW, MAX);

			const deleted = await routeA.reset();

			expect(deleted).toBe(1);
			expect((await read(routeA, 'ip-2')).current).toBe(0);
			expect((await read(routeB, 'ip-2')).current).toBe(1);
		});
	});

	// Note on Redis-error-to-callback: reproducing a driver error deterministically
	// here would require stopping or corrupting the shared RedisConnection used by
	// every integration spec in this file, which would leak state across tests and
	// introduce flakiness. The error path (catch -> callback(error, null)) is a
	// thin, synchronous adapter over the Redis client promise and is intentionally
	// left out of this suite rather than covered by a fragile, order-dependent test.
});
