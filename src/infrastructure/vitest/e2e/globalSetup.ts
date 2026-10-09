import type { TestProject } from 'vitest/node';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';
import { env } from '@/env';

declare module 'vitest' {
	interface ProvidedContext {
		mongoConnectionString: string | undefined;
		redisCacheConnectionString: string | undefined;
		bullmqConnectionString: string | undefined;
	}
}

let mongod: MongoMemoryReplSet | undefined;
let redisServer: RedisMemoryServer | undefined;

export async function setup(project: TestProject): Promise<void> {
	let mongoConnectionString: string | undefined;
	let redisCacheConnectionString: string | undefined;
	let bullmqConnectionString: string | undefined;

	if (env.MONGO_MODE === 'managed') {
		mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
		mongoConnectionString = mongod.getUri();
	}

	if (env.REDIS_MODE === 'managed') {
		// A single managed Redis instance is shared by the cache and the queue,
		// isolated by logical database: db 0 for the cache, db 1 for BullMQ. The
		// separate-instance recommendation exists to avoid the cache evicting
		// queue keys, which cannot happen here because the ephemeral server runs
		// without a maxmemory limit (no eviction regardless of policy).
		redisServer = await RedisMemoryServer.create();
		const host = await redisServer.getHost();
		const port = await redisServer.getPort();
		redisCacheConnectionString = `redis://${host}:${port}/0`;
		bullmqConnectionString = `redis://${host}:${port}/1`;
	}

	project.provide('mongoConnectionString', mongoConnectionString);
	project.provide('redisCacheConnectionString', redisCacheConnectionString);
	project.provide('bullmqConnectionString', bullmqConnectionString);
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
