import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { OwnerManagementRequiresTransferError } from '@/core/accounts/errors/user.errors';
import { BadRequestError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { DeleteProfile } from './deleteProfile.dtos';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { getManagedStoredFileName } from '@/shared/helpers/file.helpers';
import { logger } from '@/shared/providers/logger';
import { Roles } from '@/shared/accessControl/roles';

export class DeleteProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private transactionManager: ITransactionManager,
		private storageProvider: IStorageProvider,
	) {}

	async execute({ id }: DeleteProfile): Promise<void> {
		const user = await this.transactionManager.withTransaction(async () => {
			const persistedUser = await this.usersRepository.findById(id);
			if (!persistedUser) {
				throw new BadRequestError('apiResponses.users.notExist', { path: 'DeleteProfile.service' });
			}
			if (persistedUser.role === Roles.owner) {
				throw new OwnerManagementRequiresTransferError({ path: 'DeleteProfile.service' });
			}

			await this.usersRepository.delete(id);
			await this.credentialsRepository.deleteByUserId(id);
			await this.identitiesRepository.deleteByUserId(id);
			await this.tokensRepository.deleteByUserId(id);

			return persistedUser;
		});

		const avatarName = getManagedStoredFileName(user.avatarUrl, id, 'avatar');
		if (avatarName) {
			try {
				await this.storageProvider.deleteFile(avatarName);
			} catch (error) {
				logger.error(error, 'Unable to delete the profile avatar after account deletion');
			}
		}

		// TODO: Enqueue engagement cleanup for comments and ratings by user id.
	}
}
