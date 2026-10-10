import { parseNodeEnv } from '@/env/node';
import { logger } from '@/shared/providers/logger';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import { resolveEmailWorker } from '@/infrastructure/bullmq/workers/email/emailWorker.container';

const { NODE_ENV } = parseNodeEnv();

process.on('unhandledRejection', (err) => {
	logger.fatal(err);
	process.exit(1);
});

const container = async () => {
	logger.info(`env file successfully loaded for ${NODE_ENV}`);
	await BullMQConnection.Instance.start();
	const worker = resolveEmailWorker();
	process.send?.('ready');

	const closeWorker = (signal: string) => async (): Promise<void> => {
		logger.info(`close worker on ${signal}`);

		try {
			// Close the worker before stopping the connection so in-flight jobs drain first.
			await worker.close();
			await BullMQConnection.Instance.stop();
		} catch (error) {
			logger.error(error);
			process.exit(1);
		}
		process.exit(0);
	};

	for (const signal of ['SIGINT', 'SIGTERM']) {
		process.on(signal, closeWorker(signal));
	}
};

void container();
