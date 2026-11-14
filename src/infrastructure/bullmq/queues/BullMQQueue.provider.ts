import { Queue, type JobsOptions } from 'bullmq';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import {
	type AddJobOptions,
	type IQueueProvider,
	type ObliterateQueueOptions,
	type QueueJobState,
} from '@/shared/providers/queue/IQueue.provider';
import type { QueueName } from '@/shared/providers/queue/queue.types';

type EngineQueue = Queue<unknown, void, string>;

export class BullMQQueueProvider<JobDataMap extends Record<string, unknown>> implements IQueueProvider<JobDataMap> {
	private queue?: EngineQueue;

	constructor(
		private readonly queueName: QueueName,
		private readonly defaultJobOptions: JobsOptions,
	) {}

	private getQueue(): EngineQueue {
		if (!this.queue) {
			this.queue = new Queue(this.queueName, {
				connection: BullMQConnection.Instance.client,
				defaultJobOptions: this.defaultJobOptions,
			});
		}
		return this.queue;
	}

	async add<Name extends keyof JobDataMap & string>(
		name: Name,
		data: JobDataMap[Name],
		options?: AddJobOptions,
	): Promise<void> {
		const jobOptions: JobsOptions | undefined = options?.deduplicationKey
			? { deduplication: { id: options.deduplicationKey } }
			: undefined;
		await this.getQueue().add(name, data, jobOptions);
	}

	async drain(delayed?: boolean): Promise<void> {
		await this.getQueue().drain(delayed);
	}

	clean(graceMs: number, limit: number, state: QueueJobState): Promise<string[]> {
		return this.getQueue().clean(graceMs, limit, state);
	}

	async obliterate(options?: ObliterateQueueOptions): Promise<void> {
		await this.getQueue().obliterate(options);
	}

	async close(): Promise<void> {
		await this.queue?.close();
	}
}
