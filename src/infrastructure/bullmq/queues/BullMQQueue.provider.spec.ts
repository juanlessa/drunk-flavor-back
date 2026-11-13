import { beforeEach, describe, expect, it, vi } from 'vitest';

const queueInstances: Array<{ name: string; options: unknown; add: ReturnType<typeof vi.fn> }> = [];

vi.mock('bullmq', () => ({
	Queue: class {
		add = vi.fn(async () => {});
		drain = vi.fn(async () => {});
		clean = vi.fn(async () => []);
		obliterate = vi.fn(async () => {});
		close = vi.fn(async () => {});
		constructor(name: string, options: unknown) {
			queueInstances.push({ name, options, add: this.add });
		}
	},
}));

vi.mock('@/infrastructure/bullmq/BullMQConnection', () => ({
	BullMQConnection: { Instance: { client: 'redis-client' } },
}));

import { BullMQQueueProvider } from './BullMQQueue.provider';

type JobMap = { 'job.a': { id: string } };

describe('BullMQQueueProvider', () => {
	beforeEach(() => {
		queueInstances.length = 0;
	});

	it('should not create the queue until it is first used', () => {
		new BullMQQueueProvider<JobMap>('cleanup', { attempts: 5 });
		expect(queueInstances).toHaveLength(0);
	});

	it('should create the queue with its name, connection and default job options', async () => {
		const provider = new BullMQQueueProvider<JobMap>('cleanup', { attempts: 5 });
		await provider.add('job.a', { id: '1' });
		expect(queueInstances).toHaveLength(1);
		expect(queueInstances[0].name).toBe('cleanup');
		expect(queueInstances[0].options).toEqual({ connection: 'redis-client', defaultJobOptions: { attempts: 5 } });
	});

	it('should enqueue without per-job options when no deduplication key is given', async () => {
		const provider = new BullMQQueueProvider<JobMap>('cleanup', {});
		await provider.add('job.a', { id: '1' });
		expect(queueInstances[0].add).toHaveBeenCalledWith('job.a', { id: '1' }, undefined);
	});

	it('should map the deduplication key to the engine deduplication id', async () => {
		const provider = new BullMQQueueProvider<JobMap>('cleanup', {});
		await provider.add('job.a', { id: '1' }, { deduplicationKey: 'job-a-1' });
		expect(queueInstances[0].add).toHaveBeenCalledWith('job.a', { id: '1' }, { deduplication: { id: 'job-a-1' } });
	});
});
