export interface IQueueProvider<JobDataMap extends Record<string, unknown>> {
	/**
	 * Adds a job to the queue.
	 *
	 * @param name - Name of the job to enqueue.
	 * @param data - JSON-serializable payload for the job.
	 */
	add<Name extends keyof JobDataMap & string>(name: Name, data: JobDataMap[Name]): Promise<void>;

	/** Closes the underlying queue and releases its resources. */
	close(): Promise<void>;
}
