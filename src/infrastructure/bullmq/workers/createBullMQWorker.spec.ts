import { beforeEach, describe, expect, it, vi } from 'vitest';

const workerInstances: Array<{ queueName: string; processor: (job: unknown) => Promise<void>; options: unknown }> = [];

vi.mock('bullmq', () => ({
	UnrecoverableError: class UnrecoverableError extends Error {},
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

import { UnrecoverableError } from 'bullmq';
import { createBullMQWorker } from './createBullMQWorker';

type JobMap = { 'job.a': { id: string }; 'job.b': { id: string } };

const makeHandlers = () => ({ 'job.a': vi.fn(async () => {}), 'job.b': vi.fn(async () => {}) });

describe('createBullMQWorker', () => {
	beforeEach(() => {
		workerInstances.length = 0;
	});

	it('should consume the given queue with the configured concurrency and connection', () => {
		createBullMQWorker<JobMap>({ queueName: 'email', handlers: makeHandlers(), concurrency: 3 });
		expect(workerInstances[0].queueName).toBe('email');
		expect(workerInstances[0].options).toEqual({ connection: 'redis-client', concurrency: 3 });
	});

	it('should dispatch each job to the handler registered for its name, passing only the payload', async () => {
		const handlers = makeHandlers();
		createBullMQWorker<JobMap>({ queueName: 'email', handlers, concurrency: 1 });
		await workerInstances[0].processor({ id: '1', name: 'job.b', data: { id: 'x' } });
		expect(handlers['job.b']).toHaveBeenCalledWith({ id: 'x' });
		expect(handlers['job.a']).not.toHaveBeenCalled();
	});

	it('should fail without retries when no handler is registered for the job name', async () => {
		createBullMQWorker<JobMap>({ queueName: 'email', handlers: makeHandlers(), concurrency: 1 });
		const failure = workerInstances[0].processor({ id: '1', name: 'job.unknown', data: {} });
		await expect(failure).rejects.toThrow('No handler registered for job "job.unknown"');
		await expect(failure).rejects.toBeInstanceOf(UnrecoverableError);
	});

	it('should not resolve inherited object keys as handlers', async () => {
		createBullMQWorker<JobMap>({ queueName: 'email', handlers: makeHandlers(), concurrency: 1 });
		await expect(workerInstances[0].processor({ id: '1', name: 'toString', data: {} })).rejects.toThrow(
			'No handler registered',
		);
	});

	it('should propagate handler failures so the engine applies its retry policy', async () => {
		const handlers = {
			...makeHandlers(),
			'job.a': vi.fn(async () => {
				throw new Error('boom');
			}),
		};
		createBullMQWorker<JobMap>({ queueName: 'email', handlers, concurrency: 1 });
		await expect(workerInstances[0].processor({ name: 'job.a', data: {} })).rejects.toThrow('boom');
	});
});
