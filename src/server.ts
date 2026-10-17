import { env } from '@/env';
import { logger } from '@/shared/providers/logger';
import { app, start } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import { createGracefulShutdown } from '@/gracefulShutdown';

process.on('unhandledRejection', (err) => {
	logger.fatal(err);
	process.exit(1);
});

const container = async () => {
	logger.info(`env file successfully loaded for ${env.NODE_ENV}`);
	await Promise.all([
		MongoConnection.Instance.start(),
		RedisConnection.Instance.start(),
		BullMQConnection.Instance.start(),
	]);
	await start();
	process.send?.('ready');
};

void container();

const closeServer = createGracefulShutdown({
	closeServer: () => app.close(),
	closeConnections: [
		{ name: 'Mongo', stop: () => MongoConnection.Instance.stop() },
		{ name: 'Redis', stop: () => RedisConnection.Instance.stop() },
		{ name: 'BullMQ', stop: () => BullMQConnection.Instance.stop() },
	],
});

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, closeServer(signal));
}
