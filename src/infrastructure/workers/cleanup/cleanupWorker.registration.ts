import { resolveDrinksModule } from '@/core/drinks/public';
import { makeClearCatalogAuthorshipHandler } from '@/core/drinks/workers/clearCatalogAuthorship.handler';
import { resolveEngagementModule } from '@/core/engagement/public';
import { makeDeleteDrinkEngagementHandler } from '@/core/engagement/workers/deleteDrinkEngagement.handler';
import { makeDeleteUserCommentsHandler } from '@/core/engagement/workers/deleteUserComments.handler';
import { makeDeleteUserFavoritesHandler } from '@/core/engagement/workers/deleteUserFavorites.handler';
import { parseWorkerEnv } from '@/env/worker';
import { createBullMQWorker } from '@/infrastructure/bullmq/workers/createBullMQWorker';
import { mongoConnection } from '@/infrastructure/process/connections';
import { CLEANUP_JOB_NAMES } from '@/shared/providers/queue/cleanup/cleanupQueue.constants';
import type { CleanupJobDataMap } from '@/shared/providers/queue/cleanup/cleanupQueue.types';
import { QUEUE_NAMES } from '@/shared/providers/queue/queue.constants';
import { resolveStorageProvider } from '@/shared/providers/storage';
import type { IWorkerRegistration } from '../IWorkerRegistration';
import { makeDeleteStorageFileHandler } from './deleteStorageFile.handler';

export const cleanupWorkerRegistration: IWorkerRegistration = {
	name: 'cleanup',
	connections: [mongoConnection],
	start: () =>
		createBullMQWorker<CleanupJobDataMap>({
			queueName: QUEUE_NAMES.cleanup,
			handlers: {
				[CLEANUP_JOB_NAMES.clearCatalogAuthorship]: makeClearCatalogAuthorshipHandler(resolveDrinksModule()),
				[CLEANUP_JOB_NAMES.deleteComments]: makeDeleteUserCommentsHandler(resolveEngagementModule()),
				[CLEANUP_JOB_NAMES.deleteFavorites]: makeDeleteUserFavoritesHandler(resolveEngagementModule()),
				[CLEANUP_JOB_NAMES.deleteDrinkEngagement]: makeDeleteDrinkEngagementHandler(resolveEngagementModule()),
				[CLEANUP_JOB_NAMES.deleteStorageFile]: makeDeleteStorageFileHandler(resolveStorageProvider()),
			},
			concurrency: parseWorkerEnv().CLEANUP_WORKER_CONCURRENCY,
		}),
};
