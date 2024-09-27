import { UploadFileOptions } from './storage.dtos';

export interface IStorageProvider {
	deleteFile(fileName: string): Promise<void>;
	uploadFile(data: UploadFileOptions): Promise<void>;
	getFileURL(fileName: string): string;
}
