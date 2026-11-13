import type { IStorageFileDeleter } from '@/shared/providers/storage/IStorage.provider';
import type { StorageFileCleanupJobData } from '@/shared/providers/queue/cleanup/cleanupQueue.types';

/**
 * Deletes a stored file that is no longer referenced. Storage providers treat an
 * already-missing file as success and throw on real failures, so a retry is safe.
 */
export const makeDeleteStorageFileHandler =
	(storage: IStorageFileDeleter) =>
	async ({ fileName }: StorageFileCleanupJobData): Promise<void> => {
		await storage.deleteFile(fileName);
	};
