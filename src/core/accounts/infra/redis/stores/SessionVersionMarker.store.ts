import { env } from '@/env';
import {
	SESSION_VERSION_MARKER_KEY_PREFIX,
	SESSION_VERSION_MARKER_READ_TIMEOUT_MS,
	SESSION_VERSION_MARKER_STORE_READY_KEY,
	SESSION_VERSION_MARKER_TTL_MARGIN_SECONDS,
	SESSION_VERSION_MARKER_WRITE_TIMEOUT_MS,
	SessionVersionMarkerUnavailableReasons,
} from '@/core/accounts/constants/sessionVersionMarker.constants';
import {
	ISessionVersionMarkerStore,
	SessionVersionMarkerLookup,
} from '@/core/accounts/stores/ISessionVersionMarker.store';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { ServerError } from '@/shared/error/error.lib';
import { logger } from '@/shared/providers/logger';

/**
 * Keeps the highest requested version (writes may arrive out of order) and always restarts the TTL, because an
 * access token issued just before the latest change stays valid for a full token lifetime from now.
 */
const RAISE_MARKER_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1]))
local requested = tonumber(ARGV[1])
if current == nil or requested > current then
	current = requested
end
redis.call('SET', KEYS[1], current, 'EX', ARGV[2])
return current
`;

class SessionVersionMarkerTimeoutError extends Error {
	constructor(operation: string, timeoutMs: number) {
		super(`Session version marker ${operation} exceeded ${timeoutMs}ms`);
		this.name = 'SessionVersionMarkerTimeoutError';
	}
}

const withTimeout = async <TResult>(operation: string, timeoutMs: number, work: Promise<TResult>): Promise<TResult> => {
	let timer: NodeJS.Timeout | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new SessionVersionMarkerTimeoutError(operation, timeoutMs)), timeoutMs);
	});
	// The command keeps running after a timeout; observe its outcome so a late rejection is not unhandled.
	work.catch(() => undefined);
	try {
		return await Promise.race([work, timeout]);
	} finally {
		clearTimeout(timer);
	}
};

export const toSessionVersionMarkerKey = (userId: string): string => `${SESSION_VERSION_MARKER_KEY_PREFIX}${userId}`;

export class SessionVersionMarkerStore implements ISessionVersionMarkerStore {
	constructor(
		private readonly ttlSeconds: number = env.ACCESS_TOKEN_EXPIRES_IN_SECONDS +
			SESSION_VERSION_MARKER_TTL_MARGIN_SECONDS,
		private readonly now: () => number = Date.now,
	) {}

	private get client() {
		return RedisConnection.Instance.client;
	}

	async raise(userId: string, minimumSessionVersion: number): Promise<void> {
		if (!Number.isInteger(minimumSessionVersion) || minimumSessionVersion < 1) {
			throw new ServerError('apiResponses.internalServerError', {
				path: 'SessionVersionMarker.store.raise',
				cause: `Invalid minimum session version: ${minimumSessionVersion}`,
			});
		}
		try {
			await withTimeout(
				'write',
				SESSION_VERSION_MARKER_WRITE_TIMEOUT_MS,
				this.client.eval(RAISE_MARKER_SCRIPT, {
					keys: [toSessionVersionMarkerKey(userId)],
					arguments: [String(minimumSessionVersion), String(this.ttlSeconds)],
				}),
			);
		} catch (error) {
			throw new ServerError('apiResponses.internalServerError', {
				path: 'SessionVersionMarker.store.raise',
				cause: error,
			});
		}
	}

	async find(userId: string): Promise<SessionVersionMarkerLookup> {
		try {
			const [marker, readyAt] = await withTimeout(
				'read',
				SESSION_VERSION_MARKER_READ_TIMEOUT_MS,
				this.client.mGet([toSessionVersionMarkerKey(userId), SESSION_VERSION_MARKER_STORE_READY_KEY]),
			);

			if (readyAt === null) {
				// First boot or a Redis restart/flush that lost markers: start the warm-up window.
				await withTimeout(
					'readiness write',
					SESSION_VERSION_MARKER_READ_TIMEOUT_MS,
					this.client.set(SESSION_VERSION_MARKER_STORE_READY_KEY, String(this.now()), { condition: 'NX' }),
				);
				return { status: 'unavailable', reason: SessionVersionMarkerUnavailableReasons.storeNotReady };
			}

			const readySince = Number(readyAt);
			if (!Number.isFinite(readySince) || this.now() - readySince < this.ttlSeconds * 1000) {
				return { status: 'unavailable', reason: SessionVersionMarkerUnavailableReasons.storeNotReady };
			}

			if (marker === null) {
				return { status: 'available', minimumSessionVersion: null };
			}

			const minimumSessionVersion = Number(marker);
			if (!Number.isInteger(minimumSessionVersion)) {
				logger.error({ userId, marker }, 'SessionVersionMarker.store.find: malformed marker');
				return { status: 'unavailable', reason: SessionVersionMarkerUnavailableReasons.storeError };
			}
			return { status: 'available', minimumSessionVersion };
		} catch (error) {
			logger.warn({ err: error, userId }, 'SessionVersionMarker.store.find: marker store unavailable');
			return { status: 'unavailable', reason: SessionVersionMarkerUnavailableReasons.storeError };
		}
	}
}
