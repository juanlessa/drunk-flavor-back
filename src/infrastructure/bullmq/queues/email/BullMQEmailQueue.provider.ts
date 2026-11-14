import { type JobsOptions } from 'bullmq';
import { QUEUE_NAMES } from '@/shared/providers/queue/queue.constants';
import { type IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { type EmailJobDataMap } from '@/shared/providers/queue/email/emailQueue.types';
import { BullMQQueueProvider } from '../BullMQQueue.provider';

const DEFAULT_EMAIL_JOB_OPTIONS: JobsOptions = {
	attempts: 5,
	backoff: { type: 'exponential', delay: 2000 },
	removeOnComplete: { age: 3600, count: 1000 },
	removeOnFail: { age: 24 * 3600 },
};

export class BullMQEmailQueueProvider extends BullMQQueueProvider<EmailJobDataMap> implements IEmailQueueProvider {
	constructor() {
		super(QUEUE_NAMES.email, DEFAULT_EMAIL_JOB_OPTIONS);
	}
}
