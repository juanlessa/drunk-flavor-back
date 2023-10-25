import { container } from 'tsyringe';
import { IStorageProvider } from './IStorage.provider';
import { LocalStorageProvider } from './implementations/LocalStorage.provider';
import { S3StorageProvider } from './implementations/S3Storage.provider';
import storageConfig from '@config/storage';

if (storageConfig.storageType === 's3') {
	container.registerSingleton<IStorageProvider>('StorageProvider', S3StorageProvider);
} else {
	container.registerSingleton<IStorageProvider>('StorageProvider', LocalStorageProvider);
}
