import { parseApiEnv } from '@/env/api';
import { parseStorageEnv } from '@/env/storage';
import { buildAppUrl } from '@/shared/helpers/appUrl.helper';
import { IStorageProvider } from './IStorage.provider';
import { LocalStorageProvider } from './implementations/LocalStorage.provider';
import { S3StorageProvider } from './implementations/S3Storage.provider';
import { STATIC_FILES_PREFIX } from './storage.constants';

let storageProvider: IStorageProvider | undefined;

const buildStorageProvider = (): IStorageProvider => {
	const storage = parseStorageEnv();
	if (storage.STORAGE_TYPE === 's3') {
		return new S3StorageProvider(storage);
	}
	return new LocalStorageProvider(() => buildAppUrl(parseApiEnv()).concat(STATIC_FILES_PREFIX));
};

export const resolveStorageProvider = (): IStorageProvider => (storageProvider ??= buildStorageProvider());
