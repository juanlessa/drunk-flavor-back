import { beforeEach, describe, expect, it, vi } from 'vitest';

const workerInstances: Array<{ queueName: string; processor: (job: unknown) => Promise<void>; options: unknown }> = [];

vi.mock('bullmq', () => ({
	Worker: class {
		on = vi.fn();
		close = vi.fn(async () => {});
		constructor(queueName: string, processor: (job: unknown) => Promise<void>, options: unknown) {
			workerInstances.push({ queueName, processor, options });
		}
	},
}));

vi.mock('@/infrastructure/bullmq/BullMQConnection', () => ({
	BullMQConnection: { Instance: { client: 'redis-client' } },
}));

vi.mock('@/shared/providers/logger', () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn() },
}));

import { createBullMQWorker } from './createBullMQWorker';

describe('createBullMQWorker', () => {
	beforeEach(() => {
		workerInstances.length = 0;
	});

	it('should consume the given queue with the configured concurrency and connection', () => {
		createBullMQWorker({ queueName: 'email', handler: vi.fn(), concurrency: 3 });
		expect(workerInstances[0].queueName).toBe('email');
		expect(workerInstances[0].options).toEqual({ connection: 'redis-client', concurrency: 3 });
	});

	it('should pass only the job payload to the handler', async () => {
		const handler = vi.fn(async () => {});
		createBullMQWorker({ queueName: 'email', handler, concurrency: 1 });
		await workerInstances[0].processor({ id: '1', name: 'verification', data: { to: 'a@b.c' } });
		expect(handler).toHaveBeenCalledWith({ to: 'a@b.c' });
	});

	it('should propagate handler failures so the engine applies its retry policy', async () => {
		const handler = vi.fn(async () => {
			throw new Error('boom');
		});
		createBullMQWorker({ queueName: 'email', handler, concurrency: 1 });
		await expect(workerInstances[0].processor({ data: {} })).rejects.toThrow('boom');
	});
});
