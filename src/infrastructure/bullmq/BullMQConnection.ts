import { createNodeRedisClient, type IRedisClient } from 'bullmq';
import { createClient, type RedisClientType } from 'redis';
import { logger } from '@/shared/logger';

/**
 * TODO: move these to the modular env (src/env) and read them from there.
 * Declared here for now so the connection is self-contained until the env
 * variables are added. The BULLMQ_REDIS_* prefix keeps the queue instance
 * configurable independently from the cache Redis, since BullMQ requires
 * maxmemory-policy=noeviction while a cache typically uses an eviction policy.
 */
const BULLMQ_REDIS_HOST = process.env.BULLMQ_REDIS_HOST ?? 'localhost';
const BULLMQ_REDIS_PORT = Number(process.env.BULLMQ_REDIS_PORT ?? 6379);
const BULLMQ_REDIS_USERNAME = process.env.BULLMQ_REDIS_USERNAME ?? '';
const BULLMQ_REDIS_PASSWORD = process.env.BULLMQ_REDIS_PASSWORD ?? '';
const BULLMQ_REDIS_DATABASE = Number(process.env.BULLMQ_REDIS_DATABASE ?? 0);
const BULLMQ_REDIS_CONNECT_TIMEOUT_MS = Number(process.env.BULLMQ_REDIS_CONNECT_TIMEOUT_MS ?? 5000);

const buildRedisUrl = (): string => {
	const credentials =
		BULLMQ_REDIS_USERNAME || BULLMQ_REDIS_PASSWORD ? `${BULLMQ_REDIS_USERNAME}:${BULLMQ_REDIS_PASSWORD}@` : '';
	return `redis://${credentials}${BULLMQ_REDIS_HOST}:${BULLMQ_REDIS_PORT}/${BULLMQ_REDIS_DATABASE}`;
};

export class BullMQConnection {
	private static _instance: BullMQConnection;

	private _client: IRedisClient | undefined;

	static get Instance(): BullMQConnection {
		return this._instance || (this._instance = new this());
	}

	get client(): IRedisClient {
		if (!this._client) {
			throw new Error('BullMQ connection is not started. Call BullMQConnection.Instance.start() first.');
		}
		return this._client;
	}

	async start(url?: string): Promise<void> {
		if (this._client) {
			return;
		}

		const client: RedisClientType = createClient({
			url: url ?? buildRedisUrl(),
			socket: {
				connectTimeout: BULLMQ_REDIS_CONNECT_TIMEOUT_MS,
			},
		});

		client.on('error', (error) => {
			logger.error(error, 'BullMQ Redis client error.');
		});

		client.on('terminated', (cause) => {
			logger.error(cause, 'BullMQ Redis client terminated; it will not reconnect.');
			this._client = undefined;
			queueMicrotask(() => client.destroy());
		});

		try {
			await client.connect();
		} catch (error) {
			client.destroy();
			throw error;
		}

		this._client = createNodeRedisClient(client);
		logger.info('BullMQ Redis connection has been stablish.');
	}

	async stop(): Promise<void> {
		if (!this._client) {
			return;
		}

		await this._client.quit();
		this._client = undefined;
		logger.info('BullMQ Redis connection has been closed.');
	}
}
