import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGracefulShutdown, SHUTDOWN_TIMEOUT_MS, WORKER_SHUTDOWN_TIMEOUT_MS } from './createGracefulShutdown';

vi.mock('@/shared/providers/logger', () => ({
	logger: {
		fatal: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		info: vi.fn(),
		debug: vi.fn(),
		trace: vi.fn(),
	},
}));

describe('createGracefulShutdown', () => {
	const exitSpy = vi.spyOn(process, 'exit');

	beforeEach(() => {
		process.exitCode = undefined;
		// Prevent the timeout branch from killing the test runner.
		exitSpy.mockImplementation(() => undefined as never);
	});

	afterEach(() => {
		exitSpy.mockReset();
		process.exitCode = undefined;
		vi.useRealTimers();
	});

	it('should drain in-flight work before closing the connections', async () => {
		const order: string[] = [];
		const drain = vi.fn(async () => {
			order.push('server');
		});
		const connectionStop = vi.fn(async () => {
			order.push('connection');
		});

		const shutdown = createGracefulShutdown({
			drain,
			closeConnections: [{ name: 'Mongo', stop: connectionStop }],
		});

		await shutdown('SIGTERM')();

		expect(order).toEqual(['server', 'connection']);
		expect(process.exitCode).toBe(0);
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it('should not run cleanup twice when a second signal arrives', async () => {
		const drain = vi.fn(async () => {});
		const connectionStop = vi.fn(async () => {});

		const shutdown = createGracefulShutdown({
			drain,
			closeConnections: [{ name: 'Mongo', stop: connectionStop }],
		});

		const handler = shutdown('SIGTERM');
		await handler();
		await handler();

		expect(drain).toHaveBeenCalledTimes(1);
		expect(connectionStop).toHaveBeenCalledTimes(1);
	});

	it('should force a non-zero exit when shutdown exceeds the deadline', async () => {
		vi.useFakeTimers();

		// A server close that never resolves triggers the timeout branch.
		const drain = vi.fn(() => new Promise<void>(() => {}));
		const connectionStop = vi.fn(async () => {});

		const shutdown = createGracefulShutdown({
			drain,
			closeConnections: [{ name: 'Mongo', stop: connectionStop }],
		});

		const result = shutdown('SIGTERM')();

		await vi.advanceTimersByTimeAsync(SHUTDOWN_TIMEOUT_MS);
		await result;

		expect(exitSpy).toHaveBeenCalledWith(1);
		expect(connectionStop).not.toHaveBeenCalled();
	});

	it('should honor a custom timeout instead of the default deadline', async () => {
		vi.useFakeTimers();
		const drain = vi.fn(() => new Promise<void>(() => {}));
		const shutdown = createGracefulShutdown({ drain, closeConnections: [], timeoutMs: WORKER_SHUTDOWN_TIMEOUT_MS });
		const result = shutdown('SIGTERM')();
		await vi.advanceTimersByTimeAsync(SHUTDOWN_TIMEOUT_MS);
		expect(exitSpy).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(WORKER_SHUTDOWN_TIMEOUT_MS - SHUTDOWN_TIMEOUT_MS);
		await result;
		expect(exitSpy).toHaveBeenCalledWith(1);
	});

	it('should still close the remaining connections when one fails to stop', async () => {
		const healthy = vi.fn(async () => {});
		const shutdown = createGracefulShutdown({
			drain: vi.fn(async () => {}),
			closeConnections: [
				{
					name: 'Mongo',
					stop: vi.fn(async () => {
						throw new Error('mongo stop failed');
					}),
				},
				{ name: 'BullMQ', stop: healthy },
			],
		});
		await shutdown('SIGTERM')();
		expect(healthy).toHaveBeenCalledTimes(1);
		expect(process.exitCode).toBe(0);
	});
});
