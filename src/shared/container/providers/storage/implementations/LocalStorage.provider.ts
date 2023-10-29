import { IStorageProvider } from '../IStorage.provider';
import apiConfig from '@config/api';
import fs from 'node:fs';
import multer from 'multer';
import { resolve } from 'node:path';
import crypto from 'crypto';
import storageConfig from '@config/storage';

export class LocalStorageProvider implements IStorageProvider {
	getFileURL(fileName: string): string {
		return `${apiConfig.host}:${apiConfig.port}/files/${fileName}`;
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
			filename: (request, file, callback) => {
				const fileHash = crypto.randomBytes(16).toString('hex');
				const fileName = `${fileHash}-${file.originalname}`;
				return callback(null, fileName);
			}
		});

		return {
			storage,
			limits: {
				fieldSize: storageConfig.maxFileSize
			}
		};
	}
}
