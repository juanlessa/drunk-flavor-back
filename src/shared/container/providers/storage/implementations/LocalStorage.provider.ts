import { IStorageProvider } from '../IStorage.provider';
import { apiConfig } from '@config/api';
import fs from 'node:fs';
import multer from 'multer';
import { resolve } from 'node:path';
import storageConfig from '@config/storage';
import { hashedFileName } from './utils/hashedFileName';

export class LocalStorageProvider implements IStorageProvider {
	getFileURL(fileName: string): string {
		return `${apiConfig.HOST}:${apiConfig.PORT}/files/${fileName}`;
	}
	async deleteFile(fileName: string): Promise<void> {
		fileName = `./tmp/drink/${fileName}`;
		try {
			await fs.promises.stat(fileName);
		} catch {
			return;
		}

		await fs.promises.unlink(fileName);
		return;
	}

	configureUpload() {
		const storage = multer.diskStorage({
			destination: resolve(__dirname, '..', '..', '..', '..', '..', '..', 'tmp', 'drink'),
			filename: (_request, file, callback) => {
				const fileName = hashedFileName(file.originalname);
				return callback(null, fileName);
			}
		});

		return multer({
			storage,
			limits: {
				fieldSize: storageConfig.maxFileSize
			}
		});
	}
}
