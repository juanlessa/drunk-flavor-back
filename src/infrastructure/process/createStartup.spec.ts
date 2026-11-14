import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStartup } from './createStartup';

describe('createStartup', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should open the connections before starting to process', async () => {
		const order: string[] = [];
		const connectionStart = vi.fn(async () => {
			order.push('connection');
		});
		const startProcessing = vi.fn(async () => {
			order.push('server');
		});

		const startup = createStartup({
			startConnections: [{ name: 'Mongo', start: connectionStart }],
			startProcessing,
		});

		await startup();

		expect(order).toEqual(['connection', 'server']);
	});

	it('should signal readiness only after processing has started', async () => {
		const order: string[] = [];
		const startProcessing = vi.fn(async () => {
			order.push('server');
		});
		const signalReady = vi.fn(() => {
			order.push('ready');
		});

		const startup = createStartup({
			startConnections: [{ name: 'Mongo', start: vi.fn(async () => {}) }],
			startProcessing,
			signalReady,
		});

		await startup();

		expect(order).toEqual(['server', 'ready']);
		expect(signalReady).toHaveBeenCalledTimes(1);
	});

	it('should open independent connections concurrently', async () => {
		let active = 0;
		let maxConcurrent = 0;
		const makeStart = () =>
			vi.fn(async () => {
				active += 1;
				maxConcurrent = Math.max(maxConcurrent, active);
				await Promise.resolve();
				active -= 1;
			});

		const startup = createStartup({
			startConnections: [
				{ name: 'Mongo', start: makeStart() },
				{ name: 'Redis', start: makeStart() },
				{ name: 'BullMQ', start: makeStart() },
			],
			startProcessing: vi.fn(async () => {}),
		});

		await startup();

		expect(maxConcurrent).toBeGreaterThan(1);
	});

	it('should reject and not start processing when a connection fails', async () => {
		const startProcessing = vi.fn(async () => {});
		const signalReady = vi.fn();
		const failure = new Error('mongo down');

		const startup = createStartup({
			startConnections: [
				{
					name: 'Mongo',
					start: vi.fn(async () => {
						throw failure;
					}),
				},
			],
			startProcessing,
			signalReady,
		});

		await expect(startup()).rejects.toThrow('mongo down');
		expect(startProcessing).not.toHaveBeenCalled();
		expect(signalReady).not.toHaveBeenCalled();
	});

	it('should reject and not signal readiness when processing fails to start', async () => {
		const signalReady = vi.fn();
		const failure = new Error('listen EADDRINUSE');

		const startup = createStartup({
			startConnections: [{ name: 'Mongo', start: vi.fn(async () => {}) }],
			startProcessing: vi.fn(async () => {
				throw failure;
			}),
			signalReady,
		});

		await expect(startup()).rejects.toThrow('listen EADDRINUSE');
		expect(signalReady).not.toHaveBeenCalled();
	});
});
