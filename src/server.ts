import { env } from '@/env';
import { logger } from '@/shared/providers/logger';
import { app, start } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';

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

const closeServer = (signal: string) => (): void => {
	logger.info(`close application on ${signal}`);

	try {
		void Promise.allSettled([
			MongoConnection.Instance.stop(),
			RedisConnection.Instance.stop(),
			BullMQConnection.Instance.stop(),
			app.close(),
		]);
	} catch (error) {
		logger.error(error);
		process.exit(1);
	}
	process.exit(0);
};

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, closeServer(signal));
}
