import { IStorageProvider } from '../IStorage.provider';
import fs from 'node:fs';
import { UploadFileOptions } from '../storage.dtos';
import { pipeline } from 'node:stream';
import { STATIC_FOLDER_PATH } from '../storage.constants';
import path from 'node:path';
import { promisify } from 'node:util';
import { logger } from '@/shared/providers/logger';
import { assertSafeFileName } from '@/shared/helpers/file.helpers';

export class LocalStorageProvider implements IStorageProvider {
	/** @param getFilesUrl Resolves the public base URL lazily, so processes that never build URLs need no API settings. */
	constructor(private readonly getFilesUrl: () => string) {}

	/**
	 * Resolves a stored file name to an absolute path and asserts it stays inside the storage
	 * root. This is the last line of defense against path traversal: even if an unsafe name
	 * reaches the provider, the write/delete is refused instead of escaping the folder.
	 */
	private resolveSafePath(name: string): string {
		assertSafeFileName(name);

		const root = path.resolve(STATIC_FOLDER_PATH);
		const filePath = path.resolve(root, name);

		if (filePath !== path.join(root, name)) {
			throw new Error('Resolved file path escapes the storage root');
		}

		return filePath;
	}

	getFileURL(fileName: string): string {
		return this.getFilesUrl().concat(fileName);
	}
	async deleteFile(name: string): Promise<void> {
		const filePath = this.resolveSafePath(name);

		try {
			await fs.promises.unlink(filePath);
		} catch (error) {
			// A file that is already gone is the desired end state, which keeps deletion idempotent.
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				return;
			}
			logger.error(error, 'error deleting the file');
			throw error;
		}
	}

	async uploadFile({ fileStream, name }: UploadFileOptions): Promise<void> {
		const filePath = this.resolveSafePath(name);

		const pump = promisify(pipeline);

		await pump(fileStream, fs.createWriteStream(filePath));
	}
}
