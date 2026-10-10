import { createClient, type RedisClientType } from 'redis';
import { logger } from '@/shared/providers/logger';
import { parseRedisEnv } from '@/env/redis';

const redis = parseRedisEnv();

const buildRedisUrl = (): string => {
	// Connection values live only on the `external` branch. In managed mode the
	// URL is never used (callers pass an explicit url), so fall back to the same
	// defaults the aggregated env backfilled to keep behavior identical.
	const connection =
		redis.REDIS_MODE === 'external'
			? {
					host: redis.REDIS_HOST,
					port: redis.REDIS_PORT,
					username: redis.REDIS_USERNAME,
					password: redis.REDIS_PASSWORD,
					database: redis.REDIS_DATABASE,
				}
			: { host: 'localhost', port: 6379, username: '', password: '', database: 0 };

	const credentials =
		connection.username || connection.password ? `${connection.username}:${connection.password}@` : '';
	return `redis://${credentials}${connection.host}:${connection.port}/${connection.database}`;
};

export class RedisConnection {
	private static _instance: RedisConnection;

	private _client: RedisClientType | undefined;

	static get Instance(): RedisConnection {
		return this._instance || (this._instance = new this());
	}

	get client(): RedisClientType {
		if (!this._client) {
			throw new Error('Redis client is not connected. Call RedisConnection.Instance.start() first.');
		}
		return this._client;
	}

	async start(url?: string): Promise<void> {
		if (this._client?.isReady) {
			return;
		}

		const client: RedisClientType = createClient({
			url: url ?? buildRedisUrl(),
			socket: {
				connectTimeout: redis.REDIS_CONNECT_TIMEOUT_MS,
			},
		});

		client.on('error', (error) => {
			logger.error(error, 'Redis client error.');
		});

		client.on('terminated', (cause) => {
			logger.error(cause, 'Redis client terminated; it will not reconnect.');
			this._client = undefined;
			queueMicrotask(() => client.destroy());
		});

		try {
			await client.connect();
		} catch (error) {
			client.destroy();
			throw error;
		}

		this._client = client;
		logger.info('Redis connection has been stablish.');
	}

	async stop(): Promise<void> {
		if (!this._client) {
			return;
		}

		await this._client.close();
		this._client = undefined;
		logger.info('Redis connection has been closed.');
	}

	async flushCache(): Promise<void> {
		await this.client.flushDb();
	}

	async deleteKeysByPattern(pattern: string): Promise<number> {
		let removed = 0;
		const batch: string[] = [];

		const flushBatch = async (): Promise<void> => {
			if (batch.length === 0) {
				return;
			}
			removed += await this.client.unlink(batch);
			batch.length = 0;
		};

		for await (const key of this.client.scanIterator({ MATCH: pattern })) {
			batch.push(...(Array.isArray(key) ? key : [key]));
			if (batch.length >= 500) {
				await flushBatch();
			}
		}
		await flushBatch();

		return removed;
	}
}
