import fs from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageProvider } from './LocalStorage.provider';

vi.mock('@/shared/providers/logger', () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), fatal: vi.fn(), debug: vi.fn(), trace: vi.fn() },
}));

describe('LocalStorageProvider.deleteFile', () => {
	const provider = new LocalStorageProvider(() => 'http://localhost:3333/files/');
	const fileName = '0123456789abcdef0123456789abcdef-user-avatar.png';

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should delete the file', async () => {
		const unlink = vi.spyOn(fs.promises, 'unlink').mockResolvedValue();
		await provider.deleteFile(fileName);
		expect(unlink).toHaveBeenCalledWith(expect.stringContaining(fileName));
	});

	it('should succeed when the file no longer exists, so deletion is idempotent', async () => {
		vi.spyOn(fs.promises, 'unlink').mockRejectedValue(Object.assign(new Error('missing'), { code: 'ENOENT' }));
		await expect(provider.deleteFile(fileName)).resolves.toBeUndefined();
	});

	it('should throw real failures so the caller can retry', async () => {
		vi.spyOn(fs.promises, 'unlink').mockRejectedValue(Object.assign(new Error('denied'), { code: 'EACCES' }));
		await expect(provider.deleteFile(fileName)).rejects.toThrow('denied');
	});
});

describe('LocalStorageProvider.getFileURL', () => {
	it('should resolve the base URL lazily', () => {
		const getFilesUrl = vi.fn(() => 'http://localhost:3333/files/');
		const provider = new LocalStorageProvider(getFilesUrl);
		expect(getFilesUrl).not.toHaveBeenCalled();
		expect(provider.getFileURL('a.png')).toBe('http://localhost:3333/files/a.png');
	});
});
