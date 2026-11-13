import { Worker, type Job } from 'bullmq';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import type { IStartedWorker } from '@/infrastructure/workers/IWorkerRegistration';
import { logger } from '@/shared/providers/logger';
import type { QueueName } from '@/shared/providers/queue/queue.types';

export interface BullMQWorkerOptions<Data> {
	queueName: QueueName;
	handler: (data: Data) => Promise<void>;
	concurrency: number;
}

/**
 * Adapts an engine-agnostic handler to a BullMQ worker: it owns the BullMQ
 * connection, concurrency and event logging, so handlers stay free of them.
 */
export const createBullMQWorker = <Data, Name extends string = string>(
	options: BullMQWorkerOptions<Data>,
): IStartedWorker => {
	const { queueName, handler, concurrency } = options;
	const worker = new Worker<Data, void, Name>(queueName, (job) => handler(job.data), {
		connection: BullMQConnection.Instance.client,
		concurrency,
	});
	worker.on('completed', (job: Job<Data, void, Name>) => {
		logger.info({ jobId: job.id, jobName: job.name }, `${queueName} job completed.`);
	});
	worker.on('failed', (job: Job<Data, void, Name> | undefined, error: Error) => {
		logger.error({ err: error, jobId: job?.id, jobName: job?.name }, `${queueName} job failed.`);
	});
	worker.on('error', (error: Error) => {
		logger.error({ err: error }, `${queueName} worker error.`);
	});
	return worker;
};
