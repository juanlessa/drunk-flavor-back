import { env } from '@/env';
import { logger } from '@/shared/providers/logger';
import { app, startApp } from '@/infrastructure/fastify/app';
import { bullmqConnection, mongoConnection, redisConnection } from '@/infrastructure/process/connections';
import { createGracefulShutdown } from '@/infrastructure/process/createGracefulShutdown';
import { createStartup } from '@/infrastructure/process/createStartup';

logger.info(`env file successfully loaded for ${env.NODE_ENV}`);

process.on('unhandledRejection', (err) => {
	logger.fatal(err);
	process.exit(1);
});

const connections = [mongoConnection, redisConnection, bullmqConnection];

const startup = createStartup({
	startConnections: connections,
	startProcessing: () => startApp(),
	signalReady: () => process.send?.('ready'),
});

startup().catch((err) => {
	logger.fatal(err, 'Application startup failed.');
	process.exit(1);
});

const closeServer = createGracefulShutdown({
	drain: () => app.close(),
	closeConnections: connections,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, closeServer(signal));
}
