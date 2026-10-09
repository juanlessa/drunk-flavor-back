import { afterAll, beforeAll, inject } from 'vitest';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import { env } from '@/env';

beforeAll(async () => {
	const mongoConnectionString = inject('mongoConnectionString');
	const redisCacheConnectionString = inject('redisCacheConnectionString');
	const bullmqConnectionString = inject('bullmqConnectionString');

	await MongoConnection.Instance.start(mongoConnectionString);
	await RedisConnection.Instance.start(redisCacheConnectionString);
	await BullMQConnection.Instance.start(bullmqConnectionString);
});

afterAll(async () => {
	if (env.MONGO_MODE === 'external') {
		await MongoConnection.Instance.dropAllCollections();
	}

	await BullMQConnection.Instance.stop();
	await RedisConnection.Instance.stop();
	await MongoConnection.Instance.stop();
});
