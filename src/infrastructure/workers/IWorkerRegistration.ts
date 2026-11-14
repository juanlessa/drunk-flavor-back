import type { ManagedConnection } from '@/infrastructure/process/connections';

/** The part of a BullMQ worker the worker process relies on, independent of its job types. */
export interface IStartedWorker {
	/** Waits for the active jobs to finish, then stops the worker. */
	close: () => Promise<void>;
}

export interface IWorkerRegistration {
	name: string;

	connections: ManagedConnection[];
	start: () => IStartedWorker;
}
