import { afterAll, beforeAll, inject } from 'vitest';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';

/**
 * Per-file setup for the infrastructure integration layer.
 *
 * Connects the real Mongo and Redis connection singletons to the ephemeral
 * servers started in globalSetup, using the explicit connection-string overrides
 * of start(url) so no environment-derived URL is involved. The application,
 * Fastify, BullMQ and SMTP are never imported here.
 */
beforeAll(async () => {
	const mongoConnectionString = inject('integrationMongoConnectionString');
	const redisConnectionString = inject('integrationRedisConnectionString');

	await MongoConnection.Instance.start(mongoConnectionString);
	await RedisConnection.Instance.start(redisConnectionString);
});

afterAll(async () => {
	await RedisConnection.Instance.stop();
	await MongoConnection.Instance.stop();
});
