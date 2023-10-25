import { IUploadConfig } from './storage.dtos';

export interface IStorageProvider {
	deleteFile(fileName: string): Promise<void>;
	getFileURL(fileName: string): string;
	configureUpload(): IUploadConfig;
}
