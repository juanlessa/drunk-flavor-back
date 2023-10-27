import { IStorageProvider } from './IStorage.provider';
import { LocalStorageProvider } from './implementations/LocalStorage.provider';
import { S3StorageProvider } from './implementations/S3Storage.provider';
import storageConfig from '@config/storage';

let storageProvider: IStorageProvider;

if (storageConfig.storageType === 's3') {
	storageProvider = new S3StorageProvider();
} else {
	storageProvider = new LocalStorageProvider();
}

export const resolveStorageProvider = () => storageProvider;
