import { UnrecoverableError, Worker, type Job } from 'bullmq';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import type { IStartedWorker } from '@/infrastructure/workers/IWorkerRegistration';
import { logger } from '@/shared/providers/logger';
import type { QueueName } from '@/shared/providers/queue/queue.types';

export type JobHandlers<JobDataMap extends Record<string, unknown>> = {
	[Name in keyof JobDataMap & string]: (data: JobDataMap[Name]) => Promise<void>;
};

export interface BullMQWorkerOptions<JobDataMap extends Record<string, unknown>> {
	queueName: QueueName;
	handlers: JobHandlers<JobDataMap>;
	concurrency: number;
}

export const createBullMQWorker = <JobDataMap extends Record<string, unknown>>(
	options: BullMQWorkerOptions<JobDataMap>,
): IStartedWorker => {
	const { queueName, handlers, concurrency } = options;
	type Name = keyof JobDataMap & string;
	const worker = new Worker<JobDataMap[Name], void, Name>(
		queueName,
		async (job) => {
			const handler = Object.hasOwn(handlers, job.name) ? handlers[job.name] : undefined;
			if (!handler) {
				throw new UnrecoverableError(`No handler registered for job "${job.name}" on queue "${queueName}".`);
			}
			await handler(job.data);
		},
		{
			connection: BullMQConnection.Instance.client,
			concurrency,
		},
	);
	worker.on('completed', (job: Job<JobDataMap[Name], void, Name>) => {
		logger.info({ jobId: job.id, jobName: job.name }, `${queueName} job completed.`);
	});
	worker.on('failed', (job: Job<JobDataMap[Name], void, Name> | undefined, error: Error) => {
		logger.error({ err: error, jobId: job?.id, jobName: job?.name }, `${queueName} job failed.`);
	});
	worker.on('error', (error: Error) => {
		logger.error({ err: error }, `${queueName} worker error.`);
	});
	return worker;
};
