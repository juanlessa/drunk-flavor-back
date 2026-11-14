import { type JobsOptions } from 'bullmq';
import { QUEUE_NAMES } from '@/shared/providers/queue/queue.constants';
import { type ICleanupQueueProvider } from '@/shared/providers/queue/cleanup/ICleanupQueue.provider';
import { type CleanupJobDataMap } from '@/shared/providers/queue/cleanup/cleanupQueue.types';
import { BullMQQueueProvider } from '../BullMQQueue.provider';

const DEFAULT_CLEANUP_JOB_OPTIONS: JobsOptions = {
	attempts: 5,
	backoff: { type: 'exponential', delay: 5000 },
	removeOnComplete: { age: 3600, count: 1000 },
	removeOnFail: { age: 7 * 24 * 3600 },
};

export class BullMQCleanupQueueProvider
	extends BullMQQueueProvider<CleanupJobDataMap>
	implements ICleanupQueueProvider
{
	constructor() {
		super(QUEUE_NAMES.cleanup, DEFAULT_CLEANUP_JOB_OPTIONS);
	}
}
