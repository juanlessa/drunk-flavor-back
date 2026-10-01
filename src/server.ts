import { env } from '@/env';
import { logger } from '@/shared/logger';
import { app, start } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';

process.on('unhandledRejection', (err) => {
	logger.error(err);
	process.exit(1);
});

const container = async () => {
	logger.info(`env file successfully loaded for ${env.NODE_ENV}`);
	await MongoConnection.Instance.start();
	await start();
	process.send?.('ready');
};

void container();

const closeServer = (signal: string) => (): void => {
	logger.info(`close application on ${signal}`);

	try {
		void Promise.allSettled([MongoConnection.Instance.stop(), app.close()]);
	} catch (error) {
		logger.error(error);
		process.exit(1);
	}
	process.exit(0);
};

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, closeServer(signal));
}
