import { logger } from '@/shared/providers/logger';
import type { CleanupJobRequest } from './cleanupJobs';
import type { ICleanupQueueProvider } from './ICleanupQueue.provider';

/**
 * Enqueues cleanup jobs that must follow a change which has already been committed.
 *
 * Each job is enqueued independently and a failure is logged with the given context
 * instead of thrown: the change it follows has already happened, so failing the caller
 * would report an error for work that succeeded. The jobs are idempotent and deduplicated,
 * so enqueueing them again is safe.
 */
export const enqueueCleanupJobs = async (
	cleanupQueueProvider: ICleanupQueueProvider,
	jobs: CleanupJobRequest[],
	logContext: Record<string, unknown>,
): Promise<void> => {
	const results = await Promise.allSettled(
		// The request is a union keyed by job name, so its name and data always correspond;
		// TypeScript cannot correlate the two fields across the union, hence the cast.
		jobs.map((job) =>
			cleanupQueueProvider.add(job.name, job.data as never, { deduplicationKey: job.deduplicationKey }),
		),
	);
	results.forEach((result, index) => {
		if (result.status === 'rejected') {
			logger.error(
				{ err: result.reason as unknown, jobName: jobs[index].name, ...logContext },
				'Unable to enqueue cleanup job',
			);
		}
	});
};
