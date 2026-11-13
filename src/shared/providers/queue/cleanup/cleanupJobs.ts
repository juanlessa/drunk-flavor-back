import { CLEANUP_JOB_NAMES } from './cleanupQueue.constants';
import type { CleanupJobDataMap } from './cleanupQueue.types';

/** A cleanup job ready to enqueue, with the key that deduplicates it while it is pending. */
export type CleanupJobRequest = {
	[Name in keyof CleanupJobDataMap & string]: {
		name: Name;
		data: CleanupJobDataMap[Name];
		deduplicationKey: string;
	};
}[keyof CleanupJobDataMap & string];

/**
 * One builder per job keeps the payload and the deduplication key together, so every
 * producer enqueues the same unit of work under the same key.
 */
export const clearCatalogAuthorshipJob = (userId: string): CleanupJobRequest => ({
	name: CLEANUP_JOB_NAMES.clearCatalogAuthorship,
	data: { userId },
	deduplicationKey: `clear-catalog-authorship-${userId}`,
});

export const deleteCommentsJob = (userId: string): CleanupJobRequest => ({
	name: CLEANUP_JOB_NAMES.deleteComments,
	data: { userId },
	deduplicationKey: `delete-comments-${userId}`,
});

export const deleteFavoritesJob = (userId: string): CleanupJobRequest => ({
	name: CLEANUP_JOB_NAMES.deleteFavorites,
	data: { userId },
	deduplicationKey: `delete-favorites-${userId}`,
});

export const deleteDrinkEngagementJob = (drinkId: string): CleanupJobRequest => ({
	name: CLEANUP_JOB_NAMES.deleteDrinkEngagement,
	data: { drinkId },
	deduplicationKey: `delete-drink-engagement-${drinkId}`,
});

export const deleteStorageFileJob = (fileName: string): CleanupJobRequest => ({
	name: CLEANUP_JOB_NAMES.deleteStorageFile,
	data: { fileName },
	deduplicationKey: `delete-storage-file-${fileName}`,
});
