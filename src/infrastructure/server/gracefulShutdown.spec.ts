import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGracefulShutdown, SHUTDOWN_TIMEOUT_MS } from './gracefulShutdown';

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

	it('should drain the server before closing the connections', async () => {
		const order: string[] = [];
		const closeServer = vi.fn(async () => {
			order.push('server');
		});
		const connectionStop = vi.fn(async () => {
			order.push('connection');
		});

		const shutdown = createGracefulShutdown({
			closeServer,
			closeConnections: [{ name: 'Mongo', stop: connectionStop }],
		});

		await shutdown('SIGTERM')();

		expect(order).toEqual(['server', 'connection']);
		expect(process.exitCode).toBe(0);
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it('should not run cleanup twice when a second signal arrives', async () => {
		const closeServer = vi.fn(async () => {});
		const connectionStop = vi.fn(async () => {});

		const shutdown = createGracefulShutdown({
			closeServer,
			closeConnections: [{ name: 'Mongo', stop: connectionStop }],
		});

		const handler = shutdown('SIGTERM');
		await handler();
		await handler();

		expect(closeServer).toHaveBeenCalledTimes(1);
		expect(connectionStop).toHaveBeenCalledTimes(1);
	});

	it('should force a non-zero exit when shutdown exceeds the deadline', async () => {
		vi.useFakeTimers();

		// A server close that never resolves triggers the timeout branch.
		const closeServer = vi.fn(() => new Promise<void>(() => {}));
		const connectionStop = vi.fn(async () => {});

		const shutdown = createGracefulShutdown({
			closeServer,
			closeConnections: [{ name: 'Mongo', stop: connectionStop }],
		});

		const result = shutdown('SIGTERM')();

		await vi.advanceTimersByTimeAsync(SHUTDOWN_TIMEOUT_MS);
		await result;

		expect(exitSpy).toHaveBeenCalledWith(1);
		expect(connectionStop).not.toHaveBeenCalled();
	});
});
