import { vi } from 'vitest';
import { IStorageProvider } from '../IStorage.provider';

export class MockStorageProvider implements IStorageProvider {
	getFileURL = vi.fn().mockImplementation((fileName: string) => `http://mock.test/${fileName}`);
	deleteFile = vi.fn().mockImplementation((fileName: string) => {});
	uploadFile = vi.fn().mockImplementation((fileName: string) => {});
}
