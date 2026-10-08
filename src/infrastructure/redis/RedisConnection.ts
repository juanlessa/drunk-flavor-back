import { createClient, type RedisClientType } from 'redis';
import { logger } from '@/shared/logger';

/**
 * TODO: move these to the modular env (src/env) and read them from there.
 * Declared here for now so the connection is self-contained until the env
 * variables are added.
 */
const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT ?? 6379);
const REDIS_USERNAME = process.env.REDIS_USERNAME ?? '';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? '';
const REDIS_DATABASE = Number(process.env.REDIS_DATABASE ?? 0);
const REDIS_CONNECT_TIMEOUT_MS = Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 5000);

const buildRedisUrl = (): string => {
	const credentials = REDIS_USERNAME || REDIS_PASSWORD ? `${REDIS_USERNAME}:${REDIS_PASSWORD}@` : '';
	return `redis://${credentials}${REDIS_HOST}:${REDIS_PORT}/${REDIS_DATABASE}`;
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
				connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
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
}
