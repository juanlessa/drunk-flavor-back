import { parseNodeEnv } from '@/env/node';
import { logger } from '@/shared/providers/logger';
import type { IStartedWorker } from '@/infrastructure/workers/IWorkerRegistration';
import { resolveWorkerConnections } from '@/infrastructure/workers/resolveWorkerConnections';
import { workerRegistry } from '@/infrastructure/workers/registry';
import { bullmqConnection } from '@/infrastructure/process/connections';
import { createGracefulShutdown, WORKER_SHUTDOWN_TIMEOUT_MS } from '@/infrastructure/process/createGracefulShutdown';
import { createStartup } from '@/infrastructure/process/createStartup';

const { NODE_ENV } = parseNodeEnv();
logger.info(`env file successfully loaded for ${NODE_ENV}`);

process.on('unhandledRejection', (err) => {
	logger.fatal(err);
	process.exit(1);
});

const connections = resolveWorkerConnections(workerRegistry, bullmqConnection);
const workers: IStartedWorker[] = [];

const startup = createStartup({
	startConnections: connections,
	startProcessing: async () => {
		for (const registration of workerRegistry) {
			workers.push(registration.start());
			logger.info(`${registration.name} worker started.`);
		}
	},
	signalReady: () => process.send?.('ready'),
});

startup().catch((err) => {
	logger.fatal(err, 'Worker startup failed.');
	process.exit(1);
});

const closeWorkers = createGracefulShutdown({
	drain: async () => {
		await Promise.all(workers.map((worker) => worker.close()));
	},
	closeConnections: connections,
	timeoutMs: WORKER_SHUTDOWN_TIMEOUT_MS,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, closeWorkers(signal));
}
