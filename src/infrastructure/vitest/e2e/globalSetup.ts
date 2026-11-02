import type { TestProject } from 'vitest/node';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';
import { parseControlEnv } from '@/env/control';
import type { SmtpConnection } from '@/env/smtp';
import { EPHEMERAL_PORT, MailDevServer } from '@/infrastructure/maildev/MailDevServer';

const control = parseControlEnv();

declare module 'vitest' {
	interface ProvidedContext {
		mongoConnectionString: string | undefined;
		redisCacheConnectionString: string | undefined;
		bullmqConnectionString: string | undefined;
		smtpConnection: SmtpConnection | undefined;
		maildevApiUrl: string | undefined;
	}
}

let mongod: MongoMemoryReplSet | undefined;
let redisServer: RedisMemoryServer | undefined;
let maildev: MailDevServer | undefined;

export async function setup(project: TestProject): Promise<void> {
	let mongoConnectionString: string | undefined;
	let redisCacheConnectionString: string | undefined;
	let bullmqConnectionString: string | undefined;
	let smtpConnection: SmtpConnection | undefined;
	let maildevApiUrl: string | undefined;

	if (control.MONGO_MODE === 'managed') {
		mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
		mongoConnectionString = mongod.getUri();
	}

	if (control.REDIS_MODE === 'managed') {
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

	if (control.SMTP_MODE === 'managed') {
		// Ephemeral ports keep the run isolated from a `npm run maildev` session
		// and from parallel runs. The real ports are published through
		// provide/inject because they are only known once MailDev is listening.
		maildev = new MailDevServer({ smtpPort: EPHEMERAL_PORT, webPort: EPHEMERAL_PORT });
		await maildev.start();
		smtpConnection = maildev.smtp;
		maildevApiUrl = maildev.apiUrl;
	}

	project.provide('mongoConnectionString', mongoConnectionString);
	project.provide('redisCacheConnectionString', redisCacheConnectionString);
	project.provide('bullmqConnectionString', bullmqConnectionString);
	project.provide('smtpConnection', smtpConnection);
	project.provide('maildevApiUrl', maildevApiUrl);
}

export async function teardown(): Promise<void> {
	if (maildev) {
		await maildev.stop();
		maildev = undefined;
	}

	if (redisServer) {
		await redisServer.stop();
		redisServer = undefined;
	}

	if (mongod) {
		await mongod.stop();
		mongod = undefined;
	}
}
