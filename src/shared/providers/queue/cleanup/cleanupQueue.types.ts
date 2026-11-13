import { CLEANUP_JOB_NAMES } from './cleanupQueue.constants';

export type CleanupJobName = (typeof CLEANUP_JOB_NAMES)[keyof typeof CLEANUP_JOB_NAMES];

export type UserCleanupJobData = { userId: string };
export type StorageFileCleanupJobData = { fileName: string };

export type CleanupJobDataMap = {
	[CLEANUP_JOB_NAMES.clearCatalogAuthorship]: UserCleanupJobData;
	[CLEANUP_JOB_NAMES.deleteComments]: UserCleanupJobData;
	[CLEANUP_JOB_NAMES.deleteStorageFile]: StorageFileCleanupJobData;
};

export type CleanupJobData = CleanupJobDataMap[CleanupJobName];
