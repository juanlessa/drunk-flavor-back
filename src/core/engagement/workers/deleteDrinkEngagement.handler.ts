import type { IEngagementModule } from '@/core/engagement/public';
import { logger } from '@/shared/providers/logger';
import type { DrinkCleanupJobData } from '@/shared/providers/queue/cleanup/cleanupQueue.types';

/**
 * Deletes the comments and ratings of a drink that no longer exists. Idempotent: once
 * they are gone, repeating the job deletes nothing.
 */
export const makeDeleteDrinkEngagementHandler =
	(engagementModule: Pick<IEngagementModule, 'deleteEngagementByDrink'>) =>
	async ({ drinkId }: DrinkCleanupJobData): Promise<void> => {
		const removed = await engagementModule.deleteEngagementByDrink({ drinkId });
		logger.info({ drinkId, ...removed }, 'Engagement deleted for the removed drink.');
	};
