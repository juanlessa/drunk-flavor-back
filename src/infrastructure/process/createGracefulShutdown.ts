import { logger } from '@/shared/providers/logger';

export const SHUTDOWN_TIMEOUT_MS = 10_000;
export const WORKER_SHUTDOWN_TIMEOUT_MS = 30_000;

export interface GracefulShutdownDependencies {
	drain: () => Promise<void>;
	closeConnections: Array<{ name: string; stop: () => Promise<void> }>;
	timeoutMs?: number;
}

export const createGracefulShutdown = (deps: GracefulShutdownDependencies) => {
	const { drain, closeConnections, timeoutMs = SHUTDOWN_TIMEOUT_MS } = deps;
	let isShuttingDown = false;

	const runShutdown = async (): Promise<void> => {
		// Stop accepting new work and let in-flight work drain first.
		await drain();

		// The connections are independent of each other, so close them concurrently.
		const results = await Promise.allSettled(closeConnections.map((connection) => connection.stop()));

		results.forEach((result, index) => {
			if (result.status === 'rejected') {
				logger.error(result.reason, `Failed to close ${closeConnections[index].name} connection.`);
			}
		});
	};

	return (signal: string) => async (): Promise<void> => {
		if (isShuttingDown) {
			logger.warn(`Received ${signal} while already shutting down, ignoring.`);
			return;
		}
		isShuttingDown = true;

		logger.info(`close application on ${signal}`);

		let deadline: ReturnType<typeof setTimeout> | undefined;
		const timeout = new Promise<never>((_, reject) => {
			deadline = setTimeout(() => {
				reject(new Error(`Graceful shutdown timed out after ${timeoutMs}ms`));
			}, timeoutMs);
			// Do not let the timer keep the event loop alive on its own.
			deadline.unref?.();
		});

		try {
			await Promise.race([runShutdown(), timeout]);
			// Clean shutdown: let the event loop drain naturally instead of forcing an exit.
			process.exitCode = 0;
		} catch (error) {
			// Draining failed or timed out; force a non-zero exit since we cannot drain safely.
			logger.fatal(error, 'Graceful shutdown failed.');
			process.exit(1);
		} finally {
			if (deadline) {
				clearTimeout(deadline);
			}
		}
	};
};
