import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	SESSION_VERSION_MARKER_STORE_READY_KEY,
	SessionVersionMarkerUnavailableReasons,
} from '@/core/accounts/constants/sessionVersionMarker.constants';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { SessionVersionMarkerStore, toSessionVersionMarkerKey } from './SessionVersionMarker.store';

const TTL_SECONDS = 120;
const NOW = 1_800_000_000_000;
const READY_SINCE = NOW - TTL_SECONDS * 1000;

let store: SessionVersionMarkerStore;

const markStoreReady = (readySince: number = READY_SINCE) =>
	RedisConnection.Instance.client.set(SESSION_VERSION_MARKER_STORE_READY_KEY, String(readySince));

describe('SessionVersionMarkerStore (integration)', () => {
	beforeEach(async () => {
		await RedisConnection.Instance.flushCache();
		store = new SessionVersionMarkerStore(TTL_SECONDS, () => NOW);
	});

	afterEach(async () => {
		vi.restoreAllMocks();
		await RedisConnection.Instance.flushCache();
	});

	describe('raise', () => {
		it('stores the version under the auth namespace with the full marker TTL', async () => {
			await store.raise('user-id', 4);

			const key = toSessionVersionMarkerKey('user-id');
			expect(key).toBe('auth:session-version:user-id');
			expect(await RedisConnection.Instance.client.get(key)).toBe('4');
			const ttl = await RedisConnection.Instance.client.ttl(key);
			expect(ttl).toBeGreaterThan(TTL_SECONDS - 5);
			expect(ttl).toBeLessThanOrEqual(TTL_SECONDS);
		});

		it('keeps the highest version when writes arrive out of order and restarts the TTL', async () => {
			const key = toSessionVersionMarkerKey('user-id');
			await store.raise('user-id', 6);
			await RedisConnection.Instance.client.expire(key, 10);

			await store.raise('user-id', 5);

			expect(await RedisConnection.Instance.client.get(key)).toBe('6');
			expect(await RedisConnection.Instance.client.ttl(key)).toBeGreaterThan(TTL_SECONDS - 5);
		});

		it.each([0, -1, 1.5, Number.NaN])('rejects the invalid version %s without writing', async (version) => {
			await expect(store.raise('user-id', version)).rejects.toThrow();
			expect(await RedisConnection.Instance.client.exists(toSessionVersionMarkerKey('user-id'))).toBe(0);
		});

		it('fails closed when Redis rejects the write', async () => {
			vi.spyOn(RedisConnection.Instance.client, 'eval').mockRejectedValueOnce(new Error('Redis unavailable'));

			await expect(store.raise('user-id', 2)).rejects.toThrow();
		});
	});

	describe('find', () => {
		it('starts the warm-up window and reports not ready when the readiness key is missing', async () => {
			await store.raise('user-id', 3);

			await expect(store.find('user-id')).resolves.toEqual({
				status: 'unavailable',
				reason: SessionVersionMarkerUnavailableReasons.storeNotReady,
			});
			expect(await RedisConnection.Instance.client.get(SESSION_VERSION_MARKER_STORE_READY_KEY)).toBe(String(NOW));
		});

		it('does not reset an existing readiness key', async () => {
			await markStoreReady(NOW - 1000);

			await store.find('user-id');

			expect(await RedisConnection.Instance.client.get(SESSION_VERSION_MARKER_STORE_READY_KEY)).toBe(
				String(NOW - 1000),
			);
		});

		it('reports not ready until the readiness key is older than one marker TTL', async () => {
			await markStoreReady(READY_SINCE + 1);

			await expect(store.find('user-id')).resolves.toEqual({
				status: 'unavailable',
				reason: SessionVersionMarkerUnavailableReasons.storeNotReady,
			});
		});

		it('reports no marker once the store is ready', async () => {
			await markStoreReady();

			await expect(store.find('user-id')).resolves.toEqual({ status: 'available', minimumSessionVersion: null });
		});

		it('returns the raised version once the store is ready', async () => {
			await markStoreReady();
			await store.raise('user-id', 7);

			await expect(store.find('user-id')).resolves.toEqual({ status: 'available', minimumSessionVersion: 7 });
		});

		it('reports a malformed marker as a store error', async () => {
			await markStoreReady();
			await RedisConnection.Instance.client.set(toSessionVersionMarkerKey('user-id'), 'not-a-number');

			await expect(store.find('user-id')).resolves.toEqual({
				status: 'unavailable',
				reason: SessionVersionMarkerUnavailableReasons.storeError,
			});
		});

		it('reports a Redis failure as a store error instead of throwing', async () => {
			vi.spyOn(RedisConnection.Instance.client, 'mGet').mockRejectedValueOnce(new Error('Redis unavailable'));

			await expect(store.find('user-id')).resolves.toEqual({
				status: 'unavailable',
				reason: SessionVersionMarkerUnavailableReasons.storeError,
			});
		});
	});
});
