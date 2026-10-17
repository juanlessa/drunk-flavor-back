import { logger } from '@/shared/providers/logger';

/**
 * Maximum time the graceful shutdown is allowed to take before the process is
 * force-exited with a non-zero code. Draining cannot be guaranteed past this
 * deadline, so it exists only as a safety net against a hung shutdown.
 */
export const SHUTDOWN_TIMEOUT_MS = 10_000;

export interface GracefulShutdownDependencies {
	/** Drains the HTTP server: stops accepting connections and waits for in-flight requests. */
	closeServer: () => Promise<void>;
	/** Independent datastore/queue connections to close after the server has drained. */
	closeConnections: Array<{ name: string; stop: () => Promise<void> }>;
}

/**
 * Builds an idempotent, time-bounded signal handler that drains the HTTP server
 * before closing the datastore/queue connections.
 *
 * Order matters: the server is closed first so in-flight requests can still use
 * the connections while they finish, then the independent connections are closed
 * concurrently.
 */
export const createGracefulShutdown = (deps: GracefulShutdownDependencies) => {
	const { closeServer, closeConnections } = deps;
	let isShuttingDown = false;

	const runShutdown = async (): Promise<void> => {
		// Stop accepting new traffic and let in-flight requests drain first.
		await closeServer();

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
				reject(new Error(`Graceful shutdown timed out after ${SHUTDOWN_TIMEOUT_MS}ms`));
			}, SHUTDOWN_TIMEOUT_MS);
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
