import { Readable } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
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
let service: UpdateAvatarService;

beforeEach(() => {
	vi.clearAllMocks();
	usersRepository = new UsersRepositoryInMemory();
	storageProvider = new MockStorageProvider();
	service = new UpdateAvatarService(usersRepository, storageProvider);
});

describe('UpdateAvatarService', () => {
	it('uploads an image and stores its public URL', async () => {
		const user = await usersRepository.create(createUserFactory());
		vi.mocked(storageProvider.getFileURL).mockImplementation((name) => `https://cdn.example.com/${name}`);

		await service.execute({ userId: user._id.toString(), fileStream, mimetype: 'image/png' });

		const updated = await usersRepository.findById(user._id.toString());
		expect(storageProvider.uploadFile).toHaveBeenCalledOnce();
		expect(updated?.avatar_url).toMatch(
			new RegExp(`^https://cdn\\.example\\.com/[0-9a-f]{32}-${user._id.toString()}-avatar\\.png$`),
		);
	});

	it('rejects unsupported file types', async () => {
		const user = await usersRepository.create(createUserFactory());

		await expect(
			service.execute({ userId: user._id.toString(), fileStream, mimetype: 'application/pdf' }),
		).rejects.toBeInstanceOf(BadRequestError);
		expect(storageProvider.uploadFile).not.toHaveBeenCalled();
	});

	it('rejects a missing user', async () => {
		await expect(
			service.execute({ userId: '507f1f77bcf86cd799439011', fileStream, mimetype: 'image/png' }),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('deletes the previous server-managed avatar after replacement', async () => {
		const user = await usersRepository.create(
			createUserFactory({
				avatar_url: 'https://cdn.example.com/0123456789abcdef0123456789abcdef-owner-avatar.webp',
			}),
		);
		const managedName = `0123456789abcdef0123456789abcdef-${user._id.toString()}-avatar.webp`;
		await usersRepository.update({ id: user._id.toString(), avatar_url: `https://cdn.example.com/${managedName}` });

		await service.execute({ userId: user._id.toString(), fileStream, mimetype: 'image/jpeg' });

		expect(storageProvider.deleteFile).toHaveBeenCalledWith(managedName);
	});

	it('does not delete an external provider avatar', async () => {
		const user = await usersRepository.create(
			createUserFactory({ avatar_url: 'https://accounts.example.com/avatar.png' }),
		);

		await service.execute({ userId: user._id.toString(), fileStream, mimetype: 'image/png' });

		expect(storageProvider.deleteFile).not.toHaveBeenCalled();
	});
});
