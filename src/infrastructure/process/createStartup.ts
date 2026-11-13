export interface StartupDependencies {
	startConnections: Array<{ name: string; start: () => Promise<void> }>;
	startProcessing: () => Promise<void>;
	signalReady?: () => void;
}

export const createStartup = (deps: StartupDependencies) => {
	const { startConnections, startProcessing, signalReady } = deps;

	return async (): Promise<void> => {
		await Promise.all(startConnections.map((connection) => connection.start()));

		await startProcessing();

		signalReady?.();
	};
};
