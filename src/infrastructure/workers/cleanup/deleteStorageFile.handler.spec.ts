import { describe, expect, it } from 'vitest';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { makeDeleteStorageFileHandler } from './deleteStorageFile.handler';

describe('makeDeleteStorageFileHandler', () => {
	it('should delete the given file from storage', async () => {
		const storage = new MockStorageProvider();
		await makeDeleteStorageFileHandler(storage)({ fileName: 'old-avatar.png' });
		expect(storage.deleteFile).toHaveBeenCalledWith('old-avatar.png');
	});

	it('should propagate storage failures so the engine retries the job', async () => {
		const storage = new MockStorageProvider();
		storage.deleteFile.mockRejectedValueOnce(new Error('s3 unavailable'));
		await expect(makeDeleteStorageFileHandler(storage)({ fileName: 'old-avatar.png' })).rejects.toThrow(
			's3 unavailable',
		);
	});
});
