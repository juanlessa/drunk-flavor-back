import { UploadFileOptions } from './storage.dtos';

/**
 * The narrow capability cleanup work needs. Implementations must be idempotent: deleting
 * a file that no longer exists succeeds, while real failures are thrown so they can be retried.
 */
export interface IStorageFileDeleter {
	deleteFile(fileName: string): Promise<void>;
}

export interface IStorageProvider extends IStorageFileDeleter {
	uploadFile(data: UploadFileOptions): Promise<void>;
	getFileURL(fileName: string): string;
}
