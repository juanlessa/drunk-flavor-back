import { createNodeRedisClient, type IRedisClient } from 'bullmq';
import { createClient, type RedisClientType } from 'redis';
import { logger } from '@/shared/providers/logger';
import { parseBullmqEnv } from '@/env/bullmq';

const bullmq = parseBullmqEnv();

const buildRedisUrl = (): string => {
	// Connection values live only on the `external` branch. In managed mode the
	// URL is never used (callers pass an explicit url), so fall back to the same
	// defaults the aggregated env backfilled to keep behavior identical.
	const connection =
		bullmq.REDIS_MODE === 'external'
			? {
					host: bullmq.BULLMQ_REDIS_HOST,
					port: bullmq.BULLMQ_REDIS_PORT,
					username: bullmq.BULLMQ_REDIS_USERNAME,
					password: bullmq.BULLMQ_REDIS_PASSWORD,
					database: bullmq.BULLMQ_REDIS_DATABASE,
				}
			: { host: 'localhost', port: 6379, username: '', password: '', database: 0 };

	const credentials =
		connection.username || connection.password ? `${connection.username}:${connection.password}@` : '';
	return `redis://${credentials}${connection.host}:${connection.port}/${connection.database}`;
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
				connectTimeout: bullmq.BULLMQ_REDIS_CONNECT_TIMEOUT_MS,
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

	async clearQueue(queueName: string, prefix = 'bull'): Promise<number> {
		return this.deleteKeysByPattern(`${prefix}:${queueName}:*`);
	}

	async clearAllQueues(prefix = 'bull'): Promise<number> {
		return this.deleteKeysByPattern(`${prefix}:*`);
	}

	private async deleteKeysByPattern(pattern: string): Promise<number> {
		const client = this.client;
		let removed = 0;
		let cursor = '0';

		do {
			const [nextCursor, keys] = await client.scan(cursor, { MATCH: pattern, COUNT: 500 });
			cursor = nextCursor;
			if (keys.length > 0) {
				removed += await client.del(...keys);
			}
		} while (cursor !== '0');

		return removed;
	}
}
