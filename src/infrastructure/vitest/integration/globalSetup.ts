import type { TestProject } from 'vitest/node';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';

declare module 'vitest' {
	interface ProvidedContext {
		integrationMongoConnectionString: string;
		integrationRedisConnectionString: string;
	}
}

let mongod: MongoMemoryReplSet | undefined;
let redisServer: RedisMemoryServer | undefined;

/**
 * Global setup for the infrastructure integration layer.
 *
 * It starts ONLY the external resources the integration specs exercise: an
 * ephemeral MongoDB replica set and an ephemeral Redis instance. It intentionally
 * does NOT start Fastify, BullMQ, or SMTP; integration specs must not import or
 * boot the application. Connection strings are published through Vitest's
 * provide/inject channel instead of environment variables, so the specs connect
 * directly without touching the env-derived connection builders.
 */
export async function setup(project: TestProject): Promise<void> {
	// A single-node replica set mirrors the e2e setup and is required by the
	// Ratings repository concurrent-create race test and any transaction-aware
	// model behavior.
	mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
	const mongoConnectionString = mongod.getUri();

	redisServer = await RedisMemoryServer.create();
	const host = await redisServer.getHost();
	const port = await redisServer.getPort();
	const redisConnectionString = `redis://${host}:${port}/0`;

	project.provide('integrationMongoConnectionString', mongoConnectionString);
	project.provide('integrationRedisConnectionString', redisConnectionString);
}

export async function teardown(): Promise<void> {
	if (redisServer) {
		await redisServer.stop();
		redisServer = undefined;
	}

	if (mongod) {
		await mongod.stop();
		mongod = undefined;
	}
}
