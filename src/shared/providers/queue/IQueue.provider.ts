/**
 * Job states that can be targeted by `clean`. Mirrors the states supported by
 * the underlying queue engine without exposing its concrete types.
 */
export type QueueJobState = 'completed' | 'wait' | 'active' | 'paused' | 'prioritized' | 'delayed' | 'failed';

/** Options for `obliterate`. */
export type ObliterateQueueOptions = {
	/** Obliterate even if there are active jobs. Defaults to false. */
	force?: boolean;
};

/**
 * Generic producer-side queue contract.
 *
 * `JobDataMap` maps each job name this queue accepts to the payload shape it
 * carries, so `add` is type-checked per job name. The interface intentionally
 * exposes no queue-engine types (e.g. BullMQ): callers depend on this
 * abstraction, not on a concrete implementation, keeping the dependency arrows
 * pointing inward.
 *
 * The maintenance methods (`drain`/`clean`/`obliterate`) follow the queue
 * engine's recommended API, which operates on the queue itself (not the shared
 * connection); the connection keeps only low-level keyspace helpers.
 */
export interface IQueueProvider<JobDataMap extends Record<string, unknown>> {
	/**
	 * Adds a job to the queue.
	 *
	 * @param name - Name of the job to enqueue.
	 * @param data - JSON-serializable payload for the job.
	 */
	add<Name extends keyof JobDataMap & string>(name: Name, data: JobDataMap[Name]): Promise<void>;

	/**
	 * Removes all jobs that are waiting (and, when `delayed` is true, delayed as
	 * well), leaving active/completed/failed jobs untouched.
	 */
	drain(delayed?: boolean): Promise<void>;

	/**
	 * Removes jobs in a specific state older than the grace period, up to a
	 * limit. Returns the ids of the removed jobs.
	 *
	 * @param graceMs - Grace period in milliseconds; jobs younger than this are kept.
	 * @param limit - Maximum number of jobs to remove.
	 * @param state - The job state to clean.
	 */
	clean(graceMs: number, limit: number, state: QueueJobState): Promise<string[]>;

	/** Completely removes the queue and all of its contents. */
	obliterate(options?: ObliterateQueueOptions): Promise<void>;

	/** Closes the underlying queue and releases its resources. */
	close(): Promise<void>;
}
