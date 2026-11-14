import type { IEngagementModule } from '@/core/engagement/public';
import { logger } from '@/shared/providers/logger';
import type { UserCleanupJobData } from '@/shared/providers/queue/cleanup/cleanupQueue.types';

/**
 * Deletes the favorites of a closed account. Idempotent: once they are gone, repeating
 * the job deletes nothing.
 */
export const makeDeleteUserFavoritesHandler =
	(engagementModule: Pick<IEngagementModule, 'deleteFavoritesByUser'>) =>
	async ({ userId }: UserCleanupJobData): Promise<void> => {
		const removed = await engagementModule.deleteFavoritesByUser({ userId });
		logger.info({ userId, removed }, 'Favorites deleted for the closed account.');
	};
