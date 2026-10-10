import { Worker, type Job, type Processor } from 'bullmq';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import { logger } from '@/shared/providers/logger';
import type { EmailJobData, EmailJobName } from '@/shared/providers/queue/email/emailQueue.types';
import { QUEUE_NAMES } from '@/shared/providers/queue/queue.constants';

export const createEmailWorker = (
	processor: Processor<EmailJobData, void, EmailJobName>,
	concurrency: number,
): Worker<EmailJobData, void, EmailJobName> => {
	const worker = new Worker<EmailJobData, void, EmailJobName>(QUEUE_NAMES.email, processor, {
		connection: BullMQConnection.Instance.client,
		concurrency,
	});

	worker.on('completed', (job: Job<EmailJobData, void, EmailJobName>) => {
		logger.info({ jobId: job.id, jobName: job.name }, 'email job completed.');
	});

	worker.on('failed', (job: Job<EmailJobData, void, EmailJobName> | undefined, error: Error) => {
		logger.error({ err: error, jobId: job?.id, jobName: job?.name }, 'email job failed.');
	});

	worker.on('error', (error: Error) => {
		logger.error({ err: error }, 'email worker error.');
	});

	return worker;
};
