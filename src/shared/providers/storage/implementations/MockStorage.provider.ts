import { type Mock, vi } from 'vitest';
import { IStorageProvider } from '../IStorage.provider';
import { UploadFileOptions } from '../storage.dtos';

export class MockStorageProvider implements IStorageProvider {
	getFileURL: Mock<(fileName: string) => string> = vi
		.fn()
		.mockImplementation((fileName: string) => `http://mock.test/${fileName}`);
	deleteFile: Mock<(fileName: string) => Promise<void>> = vi
		.fn()
		.mockImplementation((_fileName: string) => Promise.resolve());
	uploadFile: Mock<(data: UploadFileOptions) => Promise<void>> = vi
		.fn()
		.mockImplementation((_data: UploadFileOptions) => Promise.resolve());
}
