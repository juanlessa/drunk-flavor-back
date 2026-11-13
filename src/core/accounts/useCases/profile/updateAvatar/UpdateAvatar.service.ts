import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { generateStoredFileName, getManagedStoredFileName, isSupportedFileType } from '@/shared/helpers/file.helpers';
import { deleteStorageFileJob } from '@/shared/providers/queue/cleanup/cleanupJobs';
import { enqueueCleanupJobs } from '@/shared/providers/queue/cleanup/enqueueCleanupJobs.helpers';
import { ICleanupQueueProvider } from '@/shared/providers/queue/cleanup/ICleanupQueue.provider';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { UpdateAvatarCommand } from './updateAvatar.dtos';

export class UpdateAvatarService {
	constructor(
		private usersRepository: IUsersRepository,
		private storageProvider: IStorageProvider,
		private cleanupQueueProvider: ICleanupQueueProvider,
	) {}

	async execute({ userId, fileStream, mimetype }: UpdateAvatarCommand): Promise<void> {
		if (!isSupportedFileType('image', mimetype)) {
			throw new BadRequestError('apiResponses.profile.invalidAvatarFileType', {
				path: 'UpdateAvatar.service.1',
				cause: 'Unsupported avatar file type',
			});
		}

		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notFound', { path: 'UpdateAvatar.service.2' });
		}

		const name = generateStoredFileName(userId, 'avatar', mimetype);
		await this.storageProvider.uploadFile({ fileStream, name, mimetype });

		try {
			await this.usersRepository.update({ id: userId, avatarUrl: this.storageProvider.getFileURL(name) });
		} catch (error) {
			// The new file is unreferenced; remove it in the background and report the original failure.
			await enqueueCleanupJobs(this.cleanupQueueProvider, [deleteStorageFileJob(name)], { userId });
			throw error;
		}

		const previousName = getManagedStoredFileName(user.avatarUrl, userId, 'avatar');
		if (previousName) {
			await enqueueCleanupJobs(this.cleanupQueueProvider, [deleteStorageFileJob(previousName)], { userId });
		}
	}
}
