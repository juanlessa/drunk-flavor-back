import { Multer } from 'multer';

export interface IStorageProvider {
	deleteFile(fileName: string): Promise<void>;
	getFileURL(fileName: string): string;
	configureUpload(): Multer;
}
