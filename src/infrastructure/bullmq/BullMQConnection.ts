import { createNodeRedisClient, type IRedisClient } from 'bullmq';
import { createClient, type RedisClientType } from 'redis';
import { logger } from '@/shared/logger';
import { env } from '@/env';

const buildRedisUrl = (): string => {
	const credentials =
		env.BULLMQ_REDIS_USERNAME || env.BULLMQ_REDIS_PASSWORD
			? `${env.BULLMQ_REDIS_USERNAME}:${env.BULLMQ_REDIS_PASSWORD}@`
			: '';
	return `redis://${credentials}${env.BULLMQ_REDIS_HOST}:${env.BULLMQ_REDIS_PORT}/${env.BULLMQ_REDIS_DATABASE}`;
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
				connectTimeout: env.BULLMQ_REDIS_CONNECT_TIMEOUT_MS,
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
