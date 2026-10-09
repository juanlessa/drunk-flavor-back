import { createClient, type RedisClientType } from 'redis';
import { logger } from '@/shared/logger';
import { env } from '@/env';

const buildRedisUrl = (): string => {
	const credentials = env.REDIS_USERNAME || env.REDIS_PASSWORD ? `${env.REDIS_USERNAME}:${env.REDIS_PASSWORD}@` : '';
	return `redis://${credentials}${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DATABASE}`;
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
				connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
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
