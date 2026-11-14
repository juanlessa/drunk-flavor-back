import type { IEngagementModule } from '@/core/engagement/public';
import { logger } from '@/shared/providers/logger';
import type { UserCleanupJobData } from '@/shared/providers/queue/cleanup/cleanupQueue.types';

/**
 * Deletes the comments of a closed account. Idempotent: once they are gone, repeating
 * the job deletes nothing.
 */
export const makeDeleteUserCommentsHandler =
	(engagementModule: Pick<IEngagementModule, 'deleteCommentsByUser'>) =>
	async ({ userId }: UserCleanupJobData): Promise<void> => {
		const removed = await engagementModule.deleteCommentsByUser({ userId });
		logger.info({ userId, removed }, 'Comments deleted for the closed account.');
	};
