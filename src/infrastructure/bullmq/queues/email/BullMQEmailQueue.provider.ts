import { Queue, type JobsOptions } from 'bullmq';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import type { EmailJobData, EmailJobDataMap } from '@/shared/providers/queue/email/emailQueue.types';
import { QUEUE_NAMES } from '@/shared/providers/queue/queue.constants';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';

const DEFAULT_EMAIL_JOB_OPTIONS: JobsOptions = {
	attempts: 5,
	backoff: { type: 'exponential', delay: 2000 },
	removeOnComplete: { age: 3600, count: 1000 },
	removeOnFail: { age: 24 * 3600 },
};

type EmailQueue = Queue<EmailJobData, void, keyof EmailJobDataMap & string>;

export class BullMQEmailQueueProvider implements IEmailQueueProvider {
	private queue?: EmailQueue;

	/**
	 * Lazily creates the BullMQ queue on first use.
	 *
	 * The queue is not built in the constructor because that would require the
	 * shared `BullMQConnection` to be started at import time (the provider is
	 * resolved eagerly by its container). Deferring creation to the first
	 * `add`/`close` lets modules import this provider without a live Redis
	 * connection; the connection only has to be started before a job is
	 * actually enqueued.
	 */
	private getQueue(): EmailQueue {
		if (!this.queue) {
			this.queue = new Queue(QUEUE_NAMES.email, {
				connection: BullMQConnection.Instance.client,
				defaultJobOptions: DEFAULT_EMAIL_JOB_OPTIONS,
			});
		}
		return this.queue;
	}

	async add<Name extends keyof EmailJobDataMap & string>(name: Name, data: EmailJobDataMap[Name]): Promise<void> {
		await this.getQueue().add(name, data);
	}

	async close(): Promise<void> {
		await this.queue?.close();
	}
}
