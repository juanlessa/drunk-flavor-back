import { Readable } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { MockCleanupQueueProvider } from '@/shared/providers/queue/cleanup/implementations/MockCleanupQueue.provider';
import { CLEANUP_JOB_NAMES } from '@/shared/providers/queue/cleanup/cleanupQueue.constants';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { UpdateAvatarService } from './UpdateAvatar.service';

const fileStream = Object.assign(
	new Readable({
		read() {
			this.push(null);
		},
	}),
	{
		truncated: false,
		bytesRead: 128,
		pipe: vi.fn(),
		on: vi.fn(),
	},
);

let usersRepository: IUsersRepository;
let storageProvider: IStorageProvider;
let cleanupQueueProvider: MockCleanupQueueProvider;
let service: UpdateAvatarService;

beforeEach(() => {
	vi.clearAllMocks();
	usersRepository = new UsersRepositoryInMemory();
	storageProvider = new MockStorageProvider();
	cleanupQueueProvider = new MockCleanupQueueProvider();
	service = new UpdateAvatarService(usersRepository, storageProvider, cleanupQueueProvider);
});

describe('Update Avatar', () => {
	it('uploads an image and stores its public URL', async () => {
		const user = await usersRepository.create(createUserFactory());
		vi.mocked(storageProvider.getFileURL).mockImplementation((name) => `https://cdn.example.com/${name}`);

		await service.execute({ userId: user.id, fileStream, mimetype: 'image/png' });

		const updated = await usersRepository.findById(user.id);
		expect(storageProvider.uploadFile).toHaveBeenCalledOnce();
		expect(updated?.avatarUrl).toMatch(
			new RegExp(`^https://cdn\\.example\\.com/[0-9a-f]{32}-${user.id}-avatar\\.png$`),
		);
	});

	it('rejects unsupported file types', async () => {
		const user = await usersRepository.create(createUserFactory());

		await expect(
			service.execute({ userId: user.id, fileStream, mimetype: 'application/pdf' }),
		).rejects.toBeInstanceOf(BadRequestError);
		expect(storageProvider.uploadFile).not.toHaveBeenCalled();
	});

	it('rejects a missing user', async () => {
		await expect(
			service.execute({ userId: '507f1f77bcf86cd799439011', fileStream, mimetype: 'image/png' }),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('enqueues the removal of the previous server-managed avatar after replacement', async () => {
		const user = await usersRepository.create(
			createUserFactory({
				avatarUrl: 'https://cdn.example.com/0123456789abcdef0123456789abcdef-owner-avatar.webp',
			}),
		);
		const managedName = `0123456789abcdef0123456789abcdef-${user.id}-avatar.webp`;
		await usersRepository.update({ id: user.id, avatarUrl: `https://cdn.example.com/${managedName}` });

		await service.execute({ userId: user.id, fileStream, mimetype: 'image/jpeg' });

		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			{ fileName: managedName },
			{ deduplicationKey: `delete-storage-file-${managedName}` },
		);
		expect(storageProvider.deleteFile).not.toHaveBeenCalled();
	});

	it('does not enqueue the removal of an external provider avatar', async () => {
		const user = await usersRepository.create(
			createUserFactory({ avatarUrl: 'https://accounts.example.com/avatar.png' }),
		);

		await service.execute({ userId: user.id, fileStream, mimetype: 'image/png' });

		expect(cleanupQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('keeps the previous avatar and enqueues the removal of the new file when the update fails', async () => {
		const user = await usersRepository.create(createUserFactory());
		vi.spyOn(usersRepository, 'update').mockRejectedValueOnce(new Error('database unavailable'));
		await expect(service.execute({ userId: user.id, fileStream, mimetype: 'image/png' })).rejects.toThrow(
			'database unavailable',
		);
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			{ fileName: expect.stringMatching(/^[0-9a-f]{32}-.*-avatar\.png$/) as string },
			expect.anything(),
		);
		expect(storageProvider.deleteFile).not.toHaveBeenCalled();
	});
});
