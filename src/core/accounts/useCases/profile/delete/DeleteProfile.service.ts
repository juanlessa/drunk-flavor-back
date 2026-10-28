import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';
import { OwnerManagementRequiresTransferError } from '@/core/accounts/errors/user.errors';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import {
	assertAccountCanBeClosed,
	deleteAccountAvatar,
	deleteAccountData,
} from '@/core/accounts/useCases/accountClosure/accountClosure.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { IEngagementModule } from '@/core/engagement/public';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { Roles } from '@/shared/accessControl/roles';
import { DeleteProfile } from './deleteProfile.dtos';

export class DeleteProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private transactionManager: ITransactionManager,
		private storageProvider: IStorageProvider,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private engagementModule: IEngagementModule,
	) {}

	async execute({ id, administrativeContext }: DeleteProfile): Promise<void> {
		const context = administrativeContext ?? { origin: AdministrativeEventOrigins.api };
		const closedUser = await this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.findById(id);
			if (!user) {
				throw new NotFoundError('apiResponses.users.notExist', { path: 'DeleteProfile.service' });
			}
			if (user.role === Roles.owner) {
				throw new OwnerManagementRequiresTransferError({ path: 'DeleteProfile.service' });
			}
			assertAccountCanBeClosed(user, 'DeleteProfile.service.status');

			await deleteAccountData({
				user,
				actorId: user.id,
				context,
				usersRepository: this.usersRepository,
				credentialsRepository: this.credentialsRepository,
				identitiesRepository: this.identitiesRepository,
				tokensRepository: this.tokensRepository,
				administrativeEventsRepository: this.administrativeEventsRepository,
				engagementModule: this.engagementModule,
			});
			return user;
		});

		await deleteAccountAvatar(closedUser, this.storageProvider);
	}
}
