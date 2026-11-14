import type { IDrinksModule } from '@/core/drinks/public';
import { logger } from '@/shared/providers/logger';
import type { UserCleanupJobData } from '@/shared/providers/queue/cleanup/cleanupQueue.types';

export const makeClearCatalogAuthorshipHandler =
	(drinksModule: Pick<IDrinksModule, 'clearCreatorByUser'>) =>
	async ({ userId }: UserCleanupJobData): Promise<void> => {
		const touched = await drinksModule.clearCreatorByUser({ userId });
		logger.info({ userId, touched }, 'Catalog authorship cleared for the closed account.');
	};
