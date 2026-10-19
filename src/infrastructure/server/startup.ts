export interface StartupDependencies {
	/** Independent datastore/queue connections to open before the server starts listening. */
	startConnections: Array<{ name: string; start: () => Promise<void> }>;
	/** Prepares the HTTP server (plugins/routes ready) and starts listening for traffic. */
	startServer: () => Promise<void>;
	/** Notifies the process manager that the application is ready to receive traffic. */
	signalReady?: () => void;
}

/**
 * Builds a testable startup routine that mirrors the graceful-shutdown design.
 *
 * Order matters and is the reverse of shutdown: the datastore/queue connections are
 * opened first (concurrently, since they are independent) so they are available by the
 * time the server starts accepting traffic, then the HTTP server starts listening, and
 * only once everything is ready is the process manager notified.
 *
 * Any failure rejects so the caller can decide how to exit; nothing is swallowed here.
 */
export const createStartup = (deps: StartupDependencies) => {
	const { startConnections, startServer, signalReady } = deps;

	return async (): Promise<void> => {
		// The connections are independent of each other, so open them concurrently.
		// Promise.all rejects on the first failure so startup fails fast.
		await Promise.all(startConnections.map((connection) => connection.start()));

		// Connections are up; start accepting traffic.
		await startServer();

		// Everything is ready: notify the process manager (e.g. PM2/systemd readiness).
		signalReady?.();
	};
};
