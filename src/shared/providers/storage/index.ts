import { env } from '@/env';
import { IStorageProvider } from './IStorage.provider';
import { LocalStorageProvider } from './implementations/LocalStorage.provider';
import { S3StorageProvider } from './implementations/S3Storage.provider';

let storageProvider: IStorageProvider;

if (env.STORAGE_TYPE === 's3') {
	storageProvider = new S3StorageProvider();
} else {
	storageProvider = new LocalStorageProvider();
}

export const resolveStorageProvider = () => storageProvider;
