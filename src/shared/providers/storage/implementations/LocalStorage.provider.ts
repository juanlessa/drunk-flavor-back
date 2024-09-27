import { IStorageProvider } from '../IStorage.provider';
import fs from 'node:fs';
import { UploadFileOptions } from '../storage.dtos';
import { pipeline } from 'node:stream';
import { STATIC_FILES_URL, STATIC_FOLDER_PATH } from '@/infrastructure/fastify/constants/static.constants';
import path from 'node:path';
import { promisify } from 'node:util';
import { logger } from '@/shared/logger';

export class LocalStorageProvider implements IStorageProvider {
	getFileURL(fileName: string): string {
		return STATIC_FILES_URL.concat(fileName);
	}
	async deleteFile(name: string): Promise<void> {
		const filePath = path.join(STATIC_FOLDER_PATH, name);

		try {
			await fs.promises.unlink(filePath);
		} catch (error) {
			logger.error(error, 'error deleting the file');
		}
	}

	async uploadFile({ fileStream, name }: UploadFileOptions): Promise<void> {
		const filePath = path.join(STATIC_FOLDER_PATH, name);

		const pump = promisify(pipeline);

		await pump(fileStream, fs.createWriteStream(filePath));
	}
}
