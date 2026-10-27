import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { generateStoredFileName, getManagedStoredFileName, isSupportedFileType } from '@/shared/helpers/file.helpers';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { UpdateAvatarDTO } from './updateAvatar.dtos';

export class UpdateAvatarService {
	constructor(
		private usersRepository: IUsersRepository,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ userId, fileStream, mimetype }: UpdateAvatarDTO): Promise<void> {
		if (!isSupportedFileType('image', mimetype)) {
			throw new BadRequestError('apiResponses.profile.invalidAvatarFileType', {
				path: 'UpdateAvatar.service.1',
				cause: 'Unsupported avatar file type',
			});
		}

		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', { path: 'UpdateAvatar.service.2' });
		}

		const name = generateStoredFileName(userId, 'avatar', mimetype);
		await this.storageProvider.uploadFile({ fileStream, name, mimetype });

		try {
			await this.usersRepository.update({ id: userId, avatar_url: this.storageProvider.getFileURL(name) });
		} catch (error) {
			await this.storageProvider.deleteFile(name);
			throw error;
		}

		const previousName = getManagedStoredFileName(user.avatar_url, userId, 'avatar');
		if (previousName) await this.storageProvider.deleteFile(previousName);
	}
}
