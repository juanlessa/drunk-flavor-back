import { env } from '@/env';
import { logger } from '@/shared/providers/logger';
import { app, startApp } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import { createGracefulShutdown } from '@/infrastructure/server/gracefulShutdown';
import { createStartup } from '@/infrastructure/server/startup';

logger.info(`env file successfully loaded for ${env.NODE_ENV}`);

process.on('unhandledRejection', (err) => {
	logger.fatal(err);
	process.exit(1);
});

const startup = createStartup({
	startConnections: [
		{ name: 'Mongo', start: () => MongoConnection.Instance.start() },
		{ name: 'Redis', start: () => RedisConnection.Instance.start() },
		{ name: 'BullMQ', start: () => BullMQConnection.Instance.start() },
	],
	startServer: () => startApp(),
	signalReady: () => process.send?.('ready'),
});

startup().catch((err) => {
	logger.fatal(err, 'Application startup failed.');
	process.exit(1);
});

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
